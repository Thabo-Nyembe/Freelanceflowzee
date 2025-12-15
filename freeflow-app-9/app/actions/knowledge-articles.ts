'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createKnowledgeArticle(input: KnowledgeArticleInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function updateKnowledgeArticle(id: string, input: Partial<KnowledgeArticleInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function deleteKnowledgeArticle(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('knowledge_articles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { success: true }
}

export async function publishKnowledgeArticle(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function archiveKnowledgeArticle(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function submitForReview(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function scheduleArticle(id: string, scheduledAt: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function incrementArticleViews(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('views_count')
    .eq('id', id)
    .single()

  if (!article) {
    return { error: 'Article not found' }
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
    return { error: error.message }
  }

  return { data }
}

export async function rateArticle(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('rating, total_ratings')
    .eq('id', id)
    .single()

  if (!article) {
    return { error: 'Article not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/knowledge-articles-v2')
  return { data }
}

export async function getKnowledgeArticles() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
