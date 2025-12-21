'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('help-center-actions')

// Types
export interface HelpArticle {
  id: string
  user_id: string
  article_code: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'internal' | 'restricted'
  author_id: string | null
  author_name: string | null
  featured_image: string | null
  tags: string[]
  view_count: number
  helpful_count: number
  not_helpful_count: number
  related_articles: string[]
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  last_reviewed_at: string | null
  reviewed_by: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface HelpCategory {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  parent_id: string | null
  sort_order: number
  article_count: number
  is_visible: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Fetch all articles
export async function fetchArticles(): Promise<ActionResult<HelpArticle[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_articles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch articles', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Articles fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Articles fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching articles', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create article
export async function createArticle(article: Partial<HelpArticle>): Promise<ActionResult<HelpArticle>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_articles')
      .insert([{ ...article, user_id: user.id, author_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create article', { error: error.message, article })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article created successfully', { articleId: data.id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Article created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating article', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update article
export async function updateArticle(id: string, updates: Partial<HelpArticle>): Promise<ActionResult<HelpArticle>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update article', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article updated successfully', { articleId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Article updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating article', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete article (soft delete)
export async function deleteArticle(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('help_articles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      logger.error('Failed to delete article', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article deleted successfully', { articleId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess({ success: true }, 'Article deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting article', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Publish article
export async function publishArticle(id: string): Promise<ActionResult<HelpArticle>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish article', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article published successfully', { articleId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Article published successfully')
  } catch (error: any) {
    logger.error('Unexpected error publishing article', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Unpublish article
export async function unpublishArticle(id: string): Promise<ActionResult<HelpArticle>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_articles')
      .update({ status: 'draft', published_at: null })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to unpublish article', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article unpublished successfully', { articleId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Article unpublished successfully')
  } catch (error: any) {
    logger.error('Unexpected error unpublishing article', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Archive article
export async function archiveArticle(id: string): Promise<ActionResult<HelpArticle>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_articles')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive article', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article archived successfully', { articleId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Article archived successfully')
  } catch (error: any) {
    logger.error('Unexpected error archiving article', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Increment view count
export async function incrementArticleViewCount(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: article } = await supabase
      .from('help_articles')
      .select('view_count')
      .eq('id', id)
      .single()

    if (article) {
      await supabase
        .from('help_articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', id)
    }

    logger.info('Article view count incremented', { articleId: id })
    return actionSuccess({ success: true }, 'View count incremented successfully')
  } catch (error: any) {
    logger.error('Unexpected error incrementing view count', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Fetch all categories
export async function fetchCategories(): Promise<ActionResult<HelpCategory[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_categories')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) {
      logger.error('Failed to fetch categories', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Categories fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Categories fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching categories', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create category
export async function createCategory(category: Partial<HelpCategory>): Promise<ActionResult<HelpCategory>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_categories')
      .insert([{ ...category, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create category', { error: error.message, category })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Category created successfully', { categoryId: data.id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Category created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating category', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update category
export async function updateCategory(id: string, updates: Partial<HelpCategory>): Promise<ActionResult<HelpCategory>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update category', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Category updated successfully', { categoryId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Category updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating category', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete category (soft delete)
export async function deleteCategory(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('help_categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      logger.error('Failed to delete category', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Category deleted successfully', { categoryId: id })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess({ success: true }, 'Category deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting category', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Submit article feedback
export async function submitArticleFeedback(
  articleId: string,
  isHelpful: boolean,
  feedbackText?: string,
  rating?: number
): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('help_article_feedback')
      .insert([{
        article_id: articleId,
        user_id: user?.id,
        is_helpful: isHelpful,
        feedback_text: feedbackText,
        rating
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to submit article feedback', { error: error.message, articleId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article feedback submitted successfully', { articleId, isHelpful })
    revalidatePath('/dashboard/help-center-v2')
    return actionSuccess(data, 'Feedback submitted successfully')
  } catch (error: any) {
    logger.error('Unexpected error submitting article feedback', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Fetch article feedback
export async function fetchArticleFeedback(articleId: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data, error } = await supabase
      .from('help_article_feedback')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch article feedback', { error: error.message, articleId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Article feedback fetched successfully', { articleId, count: data?.length || 0 })
    return actionSuccess(data || [], 'Feedback fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching article feedback', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
