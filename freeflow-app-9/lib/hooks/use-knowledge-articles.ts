'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface KnowledgeArticle {
  id: string
  user_id: string
  title: string
  excerpt: string | null
  content: string | null
  article_type: 'guide' | 'how-to' | 'best-practice' | 'case-study' | 'reference' | 'glossary' | 'concept'
  status: 'published' | 'draft' | 'review' | 'archived' | 'scheduled'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  author: string | null
  contributors_count: number
  views_count: number
  likes_count: number
  bookmarks_count: number
  shares_count: number
  comments_count: number
  read_time_minutes: number
  rating: number
  total_ratings: number
  tags: string[]
  related_articles: string[]
  published_at: string | null
  scheduled_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface KnowledgeArticleStats {
  total: number
  published: number
  draft: number
  review: number
  archived: number
  totalViews: number
  totalLikes: number
  avgRating: number
  avgReadTime: number
}

export function useKnowledgeArticles(initialArticles: KnowledgeArticle[] = [], initialStats?: KnowledgeArticleStats) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(initialArticles)
  const [stats, setStats] = useState<KnowledgeArticleStats>(initialStats || {
    total: 0,
    published: 0,
    draft: 0,
    review: 0,
    archived: 0,
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0,
    avgReadTime: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const calculateStats = useCallback((articlesList: KnowledgeArticle[]) => {
    const totalViews = articlesList.reduce((sum, a) => sum + (a.views_count || 0), 0)
    const totalLikes = articlesList.reduce((sum, a) => sum + (a.likes_count || 0), 0)
    const totalRating = articlesList.reduce((sum, a) => sum + (a.rating || 0), 0)
    const totalReadTime = articlesList.reduce((sum, a) => sum + (a.read_time_minutes || 0), 0)

    setStats({
      total: articlesList.length,
      published: articlesList.filter(a => a.status === 'published').length,
      draft: articlesList.filter(a => a.status === 'draft').length,
      review: articlesList.filter(a => a.status === 'review').length,
      archived: articlesList.filter(a => a.status === 'archived').length,
      totalViews,
      totalLikes,
      avgRating: articlesList.length > 0 ? totalRating / articlesList.length : 0,
      avgReadTime: articlesList.length > 0 ? totalReadTime / articlesList.length : 0
    })
  }, [])

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('knowledge_articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setArticles(data || [])
      calculateStats(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  useEffect(() => {
    const channel = supabase
      .channel('knowledge_articles_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'knowledge_articles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setArticles(prev => {
              const updated = [payload.new as KnowledgeArticle, ...prev]
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setArticles(prev => {
              const updated = prev.map(a => a.id === payload.new.id ? payload.new as KnowledgeArticle : a)
              calculateStats(updated)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setArticles(prev => {
              const updated = prev.filter(a => a.id !== payload.old.id)
              calculateStats(updated)
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  const createArticle = useCallback(async (articleData: Partial<KnowledgeArticle>) => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('knowledge_articles')
        .insert([{ ...articleData, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const updateArticle = useCallback(async (id: string, updates: Partial<KnowledgeArticle>) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('knowledge_articles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const deleteArticle = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('knowledge_articles')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [supabase])

  const publishArticle = useCallback(async (id: string) => {
    return updateArticle(id, {
      status: 'published',
      published_at: new Date().toISOString()
    })
  }, [updateArticle])

  const archiveArticle = useCallback(async (id: string) => {
    return updateArticle(id, { status: 'archived' })
  }, [updateArticle])

  const incrementViews = useCallback(async (id: string) => {
    const article = articles.find(a => a.id === id)
    if (article) {
      return updateArticle(id, { views_count: (article.views_count || 0) + 1 })
    }
  }, [articles, updateArticle])

  return {
    articles,
    stats,
    loading,
    error,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    archiveArticle,
    incrementViews
  }
}
