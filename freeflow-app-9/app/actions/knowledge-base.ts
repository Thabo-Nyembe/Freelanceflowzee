'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('knowledge-base-actions')

export async function createArticle(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create article', { error, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article created successfully', { articleId: article.id })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Article created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating article', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateArticle(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article updated successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Article updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteArticle(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: article, error } = await supabase
      .from('knowledge_base')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to delete article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article deleted successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Article deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishArticle(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to publish article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article published successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Article published successfully')
  } catch (error: any) {
    logger.error('Unexpected error publishing article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function unpublishArticle(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to unpublish article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article unpublished successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Article unpublished successfully')
  } catch (error: any) {
    logger.error('Unexpected error unpublishing article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementViewCount(id: string, isUnique: boolean = false): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('knowledge_base')
      .select('view_count, unique_views, total_reads')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Article not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to increment view count', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'View count incremented successfully')
  } catch (error: any) {
    logger.error('Unexpected error incrementing view count', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rateArticle(id: string, rating: number, helpful: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('knowledge_base')
      .select('rating, rating_count, helpful_count, not_helpful_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Article not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to rate article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article rated successfully', { articleId: id, rating })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Article rated successfully')
  } catch (error: any) {
    logger.error('Unexpected error rating article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function trackReadCompletion(id: string, completionRate: number, timeOnPage: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('knowledge_base')
      .select('total_reads, avg_time_on_page_seconds')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Article not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to track read completion', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Read completion tracked successfully')
  } catch (error: any) {
    logger.error('Unexpected error tracking read completion', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSearchMetrics(id: string, clicked: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('knowledge_base')
      .select('search_appearances, search_clicks')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Article not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to update search metrics', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(article, 'Search metrics updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating search metrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createNewVersion(id: string, changeLog: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get current article
    const { data: current } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Article not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to create new version', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('New version created successfully', { articleId: id, newVersionId: newVersion.id })
    revalidatePath('/dashboard/knowledge-base-v2')
    return actionSuccess(newVersion, 'New version created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating new version', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
