'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived'
export type ArticleVisibility = 'public' | 'internal' | 'private'

export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  htmlContent?: string
  categoryId: string
  categoryName: string
  status: ArticleStatus
  visibility: ArticleVisibility
  author: ArticleAuthor
  contributors: ArticleAuthor[]
  tags: string[]
  featuredImage?: string
  attachments: ArticleAttachment[]
  relatedArticles: string[]
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  lastReviewedAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ArticleAuthor {
  id: string
  name: string
  avatar?: string
  role?: string
}

export interface ArticleAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface KnowledgeCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  order: number
  articleCount: number
  visibility: ArticleVisibility
  createdAt: string
  updatedAt: string
}

export interface ArticleFeedback {
  id: string
  articleId: string
  userId?: string
  isHelpful: boolean
  comment?: string
  createdAt: string
}

export interface KnowledgeStats {
  totalArticles: number
  publishedArticles: number
  totalCategories: number
  totalViews: number
  helpfulPercentage: number
  articlesNeedingReview: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockArticles: KnowledgeArticle[] = [
  { id: 'article-1', title: 'Getting Started Guide', slug: 'getting-started', excerpt: 'Learn how to get started with our platform', content: '# Getting Started\n\nWelcome to our platform! This guide will help you get started...', categoryId: 'cat-1', categoryName: 'Getting Started', status: 'published', visibility: 'public', author: { id: 'user-1', name: 'Alex Chen', role: 'Admin' }, contributors: [], tags: ['beginner', 'tutorial'], relatedArticles: ['article-2'], attachments: [], viewCount: 1250, helpfulCount: 180, notHelpfulCount: 12, publishedAt: '2024-01-15', createdAt: '2024-01-10', updatedAt: '2024-03-01' },
  { id: 'article-2', title: 'Account Settings', slug: 'account-settings', excerpt: 'Manage your account settings and preferences', content: '# Account Settings\n\nLearn how to customize your account...', categoryId: 'cat-2', categoryName: 'Account Management', status: 'published', visibility: 'public', author: { id: 'user-2', name: 'Sarah Miller', role: 'Support' }, contributors: [{ id: 'user-1', name: 'Alex Chen' }], tags: ['account', 'settings'], relatedArticles: ['article-1'], attachments: [], viewCount: 890, helpfulCount: 145, notHelpfulCount: 8, publishedAt: '2024-02-01', createdAt: '2024-01-25', updatedAt: '2024-02-15' },
  { id: 'article-3', title: 'API Authentication', slug: 'api-authentication', excerpt: 'How to authenticate with our API', content: '# API Authentication\n\nOur API uses OAuth 2.0 for authentication...', categoryId: 'cat-3', categoryName: 'API Documentation', status: 'published', visibility: 'internal', author: { id: 'user-1', name: 'Alex Chen', role: 'Admin' }, contributors: [], tags: ['api', 'authentication', 'developers'], relatedArticles: [], attachments: [], viewCount: 450, helpfulCount: 78, notHelpfulCount: 5, publishedAt: '2024-02-20', createdAt: '2024-02-15', updatedAt: '2024-03-10' },
  { id: 'article-4', title: 'Billing FAQ', slug: 'billing-faq', content: '# Billing FAQ\n\nAnswers to common billing questions...', categoryId: 'cat-4', categoryName: 'Billing', status: 'draft', visibility: 'public', author: { id: 'user-2', name: 'Sarah Miller' }, contributors: [], tags: ['billing', 'faq'], relatedArticles: [], attachments: [], viewCount: 0, helpfulCount: 0, notHelpfulCount: 0, createdAt: '2024-03-15', updatedAt: '2024-03-15' }
]

const mockCategories: KnowledgeCategory[] = [
  { id: 'cat-1', name: 'Getting Started', slug: 'getting-started', description: 'Beginner guides and tutorials', icon: '🚀', color: '#3b82f6', order: 1, articleCount: 5, visibility: 'public', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'cat-2', name: 'Account Management', slug: 'account-management', description: 'Account settings and preferences', icon: '👤', color: '#22c55e', order: 2, articleCount: 8, visibility: 'public', createdAt: '2024-01-01', updatedAt: '2024-01-15' },
  { id: 'cat-3', name: 'API Documentation', slug: 'api-documentation', description: 'Developer documentation', icon: '💻', color: '#8b5cf6', order: 3, articleCount: 12, visibility: 'internal', createdAt: '2024-01-01', updatedAt: '2024-02-01' },
  { id: 'cat-4', name: 'Billing', slug: 'billing', description: 'Billing and payment information', icon: '💳', color: '#f59e0b', order: 4, articleCount: 3, visibility: 'public', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

const mockStats: KnowledgeStats = {
  totalArticles: 28,
  publishedArticles: 24,
  totalCategories: 6,
  totalViews: 15680,
  helpfulPercentage: 92,
  articlesNeedingReview: 3
}

// ============================================================================
// HOOK
// ============================================================================

interface UseKnowledgeBaseOptions {
  
  categoryId?: string
}

export function useKnowledgeBase(options: UseKnowledgeBaseOptions = {}) {
  const {  categoryId } = options

  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [currentArticle, setCurrentArticle] = useState<KnowledgeArticle | null>(null)
  const [feedbacks, setFeedbacks] = useState<ArticleFeedback[]>([])
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchArticles = useCallback(async (filters?: { categoryId?: string; status?: string; visibility?: string; search?: string; tag?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.categoryId || categoryId) params.set('categoryId', filters?.categoryId || categoryId || '')
      if (filters?.status) params.set('status', filters.status)
      if (filters?.visibility) params.set('visibility', filters.visibility)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.tag) params.set('tag', filters.tag)

      const response = await fetch(`/api/knowledge-base/articles?${params}`)
      const result = await response.json()
      if (result.success) {
        setArticles(Array.isArray(result.articles) ? result.articles : [])
        setCategories(Array.isArray(result.categories) ? result.categories : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.articles
      }
      setArticles([])
      setCategories(mockCategories)
      setStats(null)
      return []
    } catch (err) {
      setArticles([])
      setCategories(mockCategories)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ categoryId])

  const createArticle = useCallback(async (data: { title: string; content: string; categoryId: string; visibility?: ArticleVisibility; tags?: string[] }) => {
    try {
      const response = await fetch('/api/knowledge-base/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setArticles(prev => [result.article, ...prev])
        return { success: true, article: result.article }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const category = categories.find(c => c.id === data.categoryId)
      const newArticle: KnowledgeArticle = {
        id: `article-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        content: data.content,
        categoryId: data.categoryId,
        categoryName: category?.name || '',
        status: 'draft',
        visibility: data.visibility || 'public',
        author: { id: 'user-1', name: 'You' },
        contributors: [],
        tags: data.tags || [],
        relatedArticles: [],
        attachments: [],
        viewCount: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setArticles(prev => [newArticle, ...prev])
      return { success: true, article: newArticle }
    }
  }, [categories])

  const updateArticle = useCallback(async (articleId: string, updates: Partial<KnowledgeArticle>) => {
    try {
      const response = await fetch(`/api/knowledge-base/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
      }
      return result
    } catch (err) {
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, ...updates } : a))
      return { success: true }
    }
  }, [])

  const deleteArticle = useCallback(async (articleId: string) => {
    try {
      await fetch(`/api/knowledge-base/articles/${articleId}`, { method: 'DELETE' })
      setArticles(prev => prev.filter(a => a.id !== articleId))
      return { success: true }
    } catch (err) {
      setArticles(prev => prev.filter(a => a.id !== articleId))
      return { success: true }
    }
  }, [])

  const publishArticle = useCallback(async (articleId: string) => {
    return updateArticle(articleId, { status: 'published', publishedAt: new Date().toISOString() })
  }, [updateArticle])

  const unpublishArticle = useCallback(async (articleId: string) => {
    return updateArticle(articleId, { status: 'draft', publishedAt: undefined })
  }, [updateArticle])

  const archiveArticle = useCallback(async (articleId: string) => {
    return updateArticle(articleId, { status: 'archived' })
  }, [updateArticle])

  const duplicateArticle = useCallback(async (articleId: string) => {
    const original = articles.find(a => a.id === articleId)
    if (!original) return { success: false, error: 'Article not found' }

    const duplicate: KnowledgeArticle = {
      ...original,
      id: `article-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      viewCount: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setArticles(prev => [duplicate, ...prev])
    return { success: true, article: duplicate }
  }, [articles])

  const recordView = useCallback(async (articleId: string) => {
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, viewCount: a.viewCount + 1 } : a))
  }, [])

  const submitFeedback = useCallback(async (articleId: string, isHelpful: boolean, comment?: string) => {
    const newFeedback: ArticleFeedback = {
      id: `feedback-${Date.now()}`,
      articleId,
      isHelpful,
      comment,
      createdAt: new Date().toISOString()
    }

    setArticles(prev => prev.map(a => {
      if (a.id !== articleId) return a
      return {
        ...a,
        helpfulCount: isHelpful ? a.helpfulCount + 1 : a.helpfulCount,
        notHelpfulCount: !isHelpful ? a.notHelpfulCount + 1 : a.notHelpfulCount
      }
    }))
    setFeedbacks(prev => [...prev, newFeedback])
    return { success: true }
  }, [])

  const createCategory = useCallback(async (data: { name: string; description?: string; icon?: string; color?: string; parentId?: string }) => {
    const newCategory: KnowledgeCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      icon: data.icon,
      color: data.color,
      parentId: data.parentId,
      order: categories.length + 1,
      articleCount: 0,
      visibility: 'public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCategories(prev => [...prev, newCategory])
    return { success: true, category: newCategory }
  }, [categories])

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<KnowledgeCategory>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    return { success: true }
  }, [])

  const deleteCategory = useCallback(async (categoryId: string, moveArticlesTo?: string) => {
    if (moveArticlesTo) {
      setArticles(prev => prev.map(a => a.categoryId === categoryId ? { ...a, categoryId: moveArticlesTo } : a))
    } else {
      setArticles(prev => prev.filter(a => a.categoryId !== categoryId))
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId))
    return { success: true }
  }, [])

  const reorderCategories = useCallback(async (categoryIds: string[]) => {
    const reordered = categoryIds.map((id, index) => {
      const category = categories.find(c => c.id === id)
      return category ? { ...category, order: index + 1 } : null
    }).filter(Boolean) as KnowledgeCategory[]
    setCategories(reordered)
    return { success: true }
  }, [categories])

  const getArticleBySlug = useCallback((slug: string): KnowledgeArticle | null => {
    return articles.find(a => a.slug === slug) || null
  }, [articles])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchArticles({ search: query })
  }, [fetchArticles])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchArticles()
  }, [fetchArticles])

  useEffect(() => { refresh() }, [refresh])

  const publishedArticles = useMemo(() => articles.filter(a => a.status === 'published'), [articles])
  const draftArticles = useMemo(() => articles.filter(a => a.status === 'draft'), [articles])
  const publicArticles = useMemo(() => publishedArticles.filter(a => a.visibility === 'public'), [publishedArticles])
  const internalArticles = useMemo(() => publishedArticles.filter(a => a.visibility === 'internal'), [publishedArticles])
  const articlesByCategory = useMemo(() => {
    const grouped: Record<string, KnowledgeArticle[]> = {}
    articles.forEach(a => {
      if (!grouped[a.categoryId]) grouped[a.categoryId] = []
      grouped[a.categoryId].push(a)
    })
    return grouped
  }, [articles])
  const popularArticles = useMemo(() => [...publishedArticles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10), [publishedArticles])
  const recentArticles = useMemo(() => [...publishedArticles].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()).slice(0, 10), [publishedArticles])
  const allTags = useMemo(() => [...new Set(articles.flatMap(a => a.tags))].sort(), [articles])

  return {
    articles, categories, currentArticle, feedbacks, stats, publishedArticles, draftArticles, publicArticles, internalArticles,
    articlesByCategory, popularArticles, recentArticles, allTags,
    isLoading, error, searchQuery,
    refresh, fetchArticles, createArticle, updateArticle, deleteArticle, publishArticle, unpublishArticle, archiveArticle, duplicateArticle,
    recordView, submitFeedback, createCategory, updateCategory, deleteCategory, reorderCategories, getArticleBySlug, search,
    setCurrentArticle
  }
}

export default useKnowledgeBase
