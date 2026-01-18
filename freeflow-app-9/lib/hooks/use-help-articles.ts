'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

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

export interface ArticleFeedback {
  id: string
  article_id: string
  user_id: string | null
  is_helpful: boolean
  feedback_text: string | null
  rating: number | null
  created_at: string
}

export interface HelpStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalCategories: number
  totalViews: number
  helpfulPercentage: number
  avgRating: number
  recentArticles: number
}

export function useHelpArticles() {
  const supabase = createClient()
  const { toast } = useToast()
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (err: unknown) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch articles', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Create article
  const createArticle = async (article: Partial<HelpArticle>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('help_articles')
        .insert([{ ...article, user_id: user.id, author_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setArticles(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Article created successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Update article
  const updateArticle = async (id: string, updates: Partial<HelpArticle>) => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setArticles(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Article updated successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Delete article (soft delete)
  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('help_articles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setArticles(prev => prev.filter(a => a.id !== id))
      toast({ title: 'Success', description: 'Article deleted' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Publish article
  const publishArticle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setArticles(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Article published' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Unpublish article
  const unpublishArticle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .update({ status: 'draft', published_at: null })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setArticles(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Article unpublished' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Archive article
  const archiveArticle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setArticles(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Article archived' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Increment view count
  const incrementViewCount = async (id: string) => {
    try {
      const article = articles.find(a => a.id === id)
      if (!article) return

      const { error } = await supabase
        .from('help_articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', id)

      if (error) throw error
      setArticles(prev => prev.map(a => a.id === id ? { ...a, view_count: a.view_count + 1 } : a))
    } catch (err) {
      console.error('Failed to increment view count:', err)
    }
  }

  // Calculate stats
  const getStats = useCallback((): HelpStats => {
    const totalHelpful = articles.reduce((sum, a) => sum + a.helpful_count, 0)
    const totalNotHelpful = articles.reduce((sum, a) => sum + a.not_helpful_count, 0)
    const totalFeedback = totalHelpful + totalNotHelpful
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return {
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => a.status === 'published').length,
      draftArticles: articles.filter(a => a.status === 'draft').length,
      totalCategories: new Set(articles.map(a => a.category_id).filter(Boolean)).size,
      totalViews: articles.reduce((sum, a) => sum + a.view_count, 0),
      helpfulPercentage: totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : 0,
      avgRating: 4.5, // Calculate from actual feedback
      recentArticles: articles.filter(a => new Date(a.created_at) > oneWeekAgo).length
    }
  }, [articles])

  // Real-time subscription
  useEffect(() => {
    fetchArticles()

    const channel = supabase
      .channel('help-articles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_articles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setArticles(prev => [payload.new as HelpArticle, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setArticles(prev => prev.map(a => a.id === payload.new.id ? payload.new as HelpArticle : a))
        } else if (payload.eventType === 'DELETE') {
          setArticles(prev => prev.filter(a => a.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchArticles, supabase])

  return {
    articles,
    loading,
    error,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    archiveArticle,
    incrementViewCount,
    getStats
  }
}

// Hook for help categories
export function useHelpCategories() {
  const supabase = createClient()
  const { toast } = useToast()
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('help_categories')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createCategory = async (category: Partial<HelpCategory>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('help_categories')
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setCategories(prev => [...prev, data])
      toast({ title: 'Success', description: 'Category created' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const updateCategory = async (id: string, updates: Partial<HelpCategory>) => {
    try {
      const { data, error } = await supabase
        .from('help_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCategories(prev => prev.map(c => c.id === id ? data : c))
      toast({ title: 'Success', description: 'Category updated' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('help_categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setCategories(prev => prev.filter(c => c.id !== id))
      toast({ title: 'Success', description: 'Category deleted' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()

    const channel = supabase
      .channel('help-categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_categories' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCategories(prev => [...prev, payload.new as HelpCategory])
        } else if (payload.eventType === 'UPDATE') {
          setCategories(prev => prev.map(c => c.id === payload.new.id ? payload.new as HelpCategory : c))
        } else if (payload.eventType === 'DELETE') {
          setCategories(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCategories, supabase])

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory
  }
}

// Hook for article feedback
export function useArticleFeedback(articleId: string) {
  const supabase = createClient()
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<ArticleFeedback[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    if (!articleId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('help_article_feedback')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedback(data || [])
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
    } finally {
      setLoading(false)
    }
  }, [articleId, supabase])

  const submitFeedback = async (isHelpful: boolean, feedbackText?: string, rating?: number) => {
    try {
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

      if (error) throw error
      setFeedback(prev => [data, ...prev])
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  return { feedback, loading, submitFeedback }
}
