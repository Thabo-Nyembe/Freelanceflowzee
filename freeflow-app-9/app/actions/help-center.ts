'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function fetchArticles() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create article
export async function createArticle(article: Partial<HelpArticle>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('help_articles')
    .insert([{ ...article, user_id: user.id, author_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Update article
export async function updateArticle(id: string, updates: Partial<HelpArticle>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('help_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Delete article (soft delete)
export async function deleteArticle(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from('help_articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, success: true }
}

// Publish article
export async function publishArticle(id: string) {
  const supabase = createServerActionClient({ cookies })

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Unpublish article
export async function unpublishArticle(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('help_articles')
    .update({ status: 'draft', published_at: null })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Archive article
export async function archiveArticle(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('help_articles')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Increment view count
export async function incrementArticleViewCount(id: string) {
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

  return { error: null, success: true }
}

// Fetch all categories
export async function fetchCategories() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('help_categories')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create category
export async function createCategory(category: Partial<HelpCategory>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('help_categories')
    .insert([{ ...category, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Update category
export async function updateCategory(id: string, updates: Partial<HelpCategory>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('help_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Delete category (soft delete)
export async function deleteCategory(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from('help_categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, success: true }
}

// Submit article feedback
export async function submitArticleFeedback(
  articleId: string,
  isHelpful: boolean,
  feedbackText?: string,
  rating?: number
) {
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/help-center-v2')
  return { error: null, data }
}

// Fetch article feedback
export async function fetchArticleFeedback(articleId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('help_article_feedback')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
