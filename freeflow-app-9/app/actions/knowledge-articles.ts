'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('knowledge-articles-actions')

export interface KnowledgeArticleInput {
  title: string
  excerpt?: string
  content?: string
  article_type?: 'guide' | 'how-to' | 'best-practice' | 'case-study' | 'reference' | 'glossary' | 'concept'
  status?: 'published' | 'draft' | 'review' | 'archived' | 'scheduled'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  author?: string
  read_time_minutes?: number
  tags?: string[]
  related_articles?: string[]
  scheduled_at?: string
  metadata?: Record<string, any>
}

export async function createKnowledgeArticle(input: KnowledgeArticleInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .insert([{
        ...input,
        user_id: user.id,
        author: input.author || user.email
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create knowledge article', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article created successfully', { articleId: data.id })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Knowledge article created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating knowledge article', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateKnowledgeArticle(id: string, input: Partial<KnowledgeArticleInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update knowledge article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article updated successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Knowledge article updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating knowledge article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteKnowledgeArticle(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('knowledge_articles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete knowledge article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article deleted successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess({ success: true }, 'Knowledge article deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting knowledge article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishKnowledgeArticle(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish knowledge article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article published successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Knowledge article published successfully')
  } catch (error: any) {
    logger.error('Unexpected error publishing knowledge article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveKnowledgeArticle(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive knowledge article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article archived successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Knowledge article archived successfully')
  } catch (error: any) {
    logger.error('Unexpected error archiving knowledge article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function submitForReview(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        status: 'review',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to submit knowledge article for review', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article submitted for review successfully', { articleId: id })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Knowledge article submitted for review successfully')
  } catch (error: any) {
    logger.error('Unexpected error submitting knowledge article for review', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function scheduleArticle(id: string, scheduledAt: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        status: 'scheduled',
        scheduled_at: scheduledAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule knowledge article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Knowledge article scheduled successfully', { articleId: id, scheduledAt })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Knowledge article scheduled successfully')
  } catch (error: any) {
    logger.error('Unexpected error scheduling knowledge article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementArticleViews(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: article } = await supabase
      .from('knowledge_articles')
      .select('views_count')
      .eq('id', id)
      .single()

    if (!article) {
      return actionError('Article not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        views_count: (article.views_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to increment article views', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data, 'Article views incremented successfully')
  } catch (error: any) {
    logger.error('Unexpected error incrementing article views', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rateArticle(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: article } = await supabase
      .from('knowledge_articles')
      .select('rating, total_ratings')
      .eq('id', id)
      .single()

    if (!article) {
      return actionError('Article not found', 'NOT_FOUND')
    }

    const newTotalRatings = (article.total_ratings || 0) + 1
    const currentTotal = (article.rating || 0) * (article.total_ratings || 0)
    const newRating = (currentTotal + rating) / newTotalRatings

    const { data, error } = await supabase
      .from('knowledge_articles')
      .update({
        rating: Math.round(newRating * 100) / 100,
        total_ratings: newTotalRatings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate article', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article rated successfully', { articleId: id, rating })
    revalidatePath('/dashboard/knowledge-articles-v2')
    return actionSuccess(data, 'Article rated successfully')
  } catch (error: any) {
    logger.error('Unexpected error rating article', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getKnowledgeArticles(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get knowledge articles', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Knowledge articles retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting knowledge articles', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
