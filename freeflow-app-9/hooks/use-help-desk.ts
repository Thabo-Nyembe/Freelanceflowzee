'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ArticleStatus = 'draft' | 'published' | 'archived'

export interface HelpArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  subcategory?: string
  tags: string[]
  status: ArticleStatus
  views: number
  helpful: number
  notHelpful: number
  authorId: string
  authorName: string
  relatedArticles: string[]
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface HelpCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color: string
  parentId?: string
  order: number
  articleCount: number
  subcategories: HelpCategory[]
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  views: number
  helpful: number
  notHelpful: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface SearchResult {
  id: string
  type: 'article' | 'faq'
  title: string
  excerpt: string
  url: string
  score: number
}

export interface ContactForm {
  id: string
  name: string
  email: string
  subject: string
  message: string
  category: string
  attachments: { name: string; url: string }[]
  status: 'new' | 'replied' | 'resolved'
  createdAt: string
}

export interface HelpStats {
  totalArticles: number
  publishedArticles: number
  totalFAQs: number
  totalViews: number
  avgHelpfulness: number
  topArticles: { id: string; title: string; views: number }[]
  topSearches: { query: string; count: number }[]
  contactSubmissions: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockArticles: HelpArticle[] = [
  {
    id: 'art-1',
    title: 'Getting Started with FreeFlow',
    slug: 'getting-started',
    content: '# Getting Started\n\nWelcome to FreeFlow! This guide will help you get started with our platform.\n\n## Step 1: Create an Account\n\nVisit our website and click Sign Up...',
    excerpt: 'Learn how to set up your FreeFlow account and start using our platform.',
    category: 'Getting Started',
    tags: ['beginner', 'setup', 'onboarding'],
    status: 'published',
    views: 15420,
    helpful: 1250,
    notHelpful: 45,
    authorId: 'user-1',
    authorName: 'Alex Chen',
    relatedArticles: ['art-2', 'art-3'],
    seoTitle: 'Getting Started Guide - FreeFlow Help',
    seoDescription: 'Complete guide to getting started with FreeFlow platform',
    publishedAt: '2024-01-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-15'
  },
  {
    id: 'art-2',
    title: 'How to Create Your First Project',
    slug: 'create-first-project',
    content: '# Creating Your First Project\n\nProjects are the foundation of FreeFlow...',
    excerpt: 'Step-by-step guide to creating and managing projects in FreeFlow.',
    category: 'Projects',
    tags: ['projects', 'beginner', 'tutorial'],
    status: 'published',
    views: 8920,
    helpful: 780,
    notHelpful: 32,
    authorId: 'user-1',
    authorName: 'Alex Chen',
    relatedArticles: ['art-1', 'art-4'],
    publishedAt: '2024-01-20',
    createdAt: '2024-01-18',
    updatedAt: '2024-03-10'
  },
  {
    id: 'art-3',
    title: 'Understanding Billing and Subscriptions',
    slug: 'billing-subscriptions',
    content: '# Billing and Subscriptions\n\nLearn about our pricing plans and billing...',
    excerpt: 'Everything you need to know about FreeFlow billing, plans, and invoices.',
    category: 'Billing',
    tags: ['billing', 'subscription', 'payments'],
    status: 'published',
    views: 6540,
    helpful: 520,
    notHelpful: 28,
    authorId: 'user-2',
    authorName: 'Sarah Miller',
    relatedArticles: ['art-5'],
    publishedAt: '2024-02-01',
    createdAt: '2024-01-25',
    updatedAt: '2024-03-05'
  },
  {
    id: 'art-4',
    title: 'Integrating with Third-Party Services',
    slug: 'third-party-integrations',
    content: '# Third-Party Integrations\n\nFreeFlow integrates with many popular services...',
    excerpt: 'Learn how to connect FreeFlow with your favorite tools and services.',
    category: 'Integrations',
    tags: ['integrations', 'api', 'webhooks'],
    status: 'draft',
    views: 0,
    helpful: 0,
    notHelpful: 0,
    authorId: 'user-1',
    authorName: 'Alex Chen',
    relatedArticles: [],
    createdAt: '2024-03-15',
    updatedAt: '2024-03-18'
  }
]

const mockCategories: HelpCategory[] = [
  { id: 'cat-1', name: 'Getting Started', slug: 'getting-started', description: 'Learn the basics', icon: 'rocket', color: '#3b82f6', order: 1, articleCount: 8, subcategories: [] },
  { id: 'cat-2', name: 'Projects', slug: 'projects', description: 'Project management guides', icon: 'folder', color: '#22c55e', order: 2, articleCount: 12, subcategories: [] },
  { id: 'cat-3', name: 'Billing', slug: 'billing', description: 'Payments and subscriptions', icon: 'credit-card', color: '#f59e0b', order: 3, articleCount: 6, subcategories: [] },
  { id: 'cat-4', name: 'Integrations', slug: 'integrations', description: 'Connect with other services', icon: 'plug', color: '#8b5cf6', order: 4, articleCount: 15, subcategories: [] },
  { id: 'cat-5', name: 'Account', slug: 'account', description: 'Account settings and security', icon: 'user', color: '#ec4899', order: 5, articleCount: 10, subcategories: [] }
]

const mockFAQs: FAQ[] = [
  { id: 'faq-1', question: 'How do I reset my password?', answer: 'Go to Settings > Security > Change Password. If you forgot your password, click "Forgot Password" on the login page.', category: 'Account', order: 1, views: 5240, helpful: 420, notHelpful: 15, isPublished: true, createdAt: '2024-01-01', updatedAt: '2024-03-01' },
  { id: 'faq-2', question: 'Can I upgrade or downgrade my plan?', answer: 'Yes! You can change your plan at any time from Settings > Billing > Change Plan. Changes take effect at your next billing cycle.', category: 'Billing', order: 1, views: 3820, helpful: 310, notHelpful: 12, isPublished: true, createdAt: '2024-01-01', updatedAt: '2024-02-15' },
  { id: 'faq-3', question: 'How do I invite team members?', answer: 'Navigate to Settings > Team > Invite Members. Enter their email addresses and select their roles.', category: 'Account', order: 2, views: 4150, helpful: 380, notHelpful: 8, isPublished: true, createdAt: '2024-01-15', updatedAt: '2024-03-10' },
  { id: 'faq-4', question: 'Is there a mobile app?', answer: 'Yes! FreeFlow is available on iOS and Android. Download from the App Store or Google Play.', category: 'Getting Started', order: 1, views: 2890, helpful: 245, notHelpful: 20, isPublished: true, createdAt: '2024-02-01', updatedAt: '2024-02-01' }
]

const mockStats: HelpStats = {
  totalArticles: 51,
  publishedArticles: 45,
  totalFAQs: 24,
  totalViews: 125000,
  avgHelpfulness: 94.5,
  topArticles: [
    { id: 'art-1', title: 'Getting Started with FreeFlow', views: 15420 },
    { id: 'art-2', title: 'How to Create Your First Project', views: 8920 },
    { id: 'art-3', title: 'Understanding Billing', views: 6540 }
  ],
  topSearches: [
    { query: 'password reset', count: 1250 },
    { query: 'billing', count: 980 },
    { query: 'integration', count: 750 }
  ],
  contactSubmissions: 45
}

// ============================================================================
// HOOK
// ============================================================================

interface UseHelpDeskOptions {
  
}

export function useHelpDesk(options: UseHelpDeskOptions = {}) {
  const {  } = options

  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [currentArticle, setCurrentArticle] = useState<HelpArticle | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [stats, setStats] = useState<HelpStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchHelpData = useCallback(async () => {
    setIsSearching(true)
    try {
      const lowerQuery = query.toLowerCase()

      // Search articles
      const articleResults: SearchResult[] = articles
        .filter(a => a.status === 'published')
        .filter(a =>
          a.title.toLowerCase().includes(lowerQuery) ||
          a.content.toLowerCase().includes(lowerQuery) ||
          a.tags.some(t => t.toLowerCase().includes(lowerQuery))
        )
        .map(a => ({
          id: a.id,
          type: 'article' as const,
          title: a.title,
          excerpt: a.excerpt,
          url: `/help/articles/${a.slug}`,
          score: a.title.toLowerCase().includes(lowerQuery) ? 10 : 5
        }))

      // Search FAQs
      const faqResults: SearchResult[] = faqs
        .filter(f => f.isPublished)
        .filter(f =>
          f.question.toLowerCase().includes(lowerQuery) ||
          f.answer.toLowerCase().includes(lowerQuery)
        )
        .map(f => ({
          id: f.id,
          type: 'faq' as const,
          title: f.question,
          excerpt: f.answer.substring(0, 150) + '...',
          url: `/help/faq#${f.id}`,
          score: f.question.toLowerCase().includes(lowerQuery) ? 10 : 5
        }))

      const results = [...articleResults, ...faqResults].sort((a, b) => b.score - a.score)
      setSearchResults(results)
      return results
    } finally {
      setIsSearching(false)
    }
  }, [articles, faqs])

  const getArticleBySlug = useCallback((slug: string) => {
    return articles.find(a => a.slug === slug) || null
  }, [articles])

  const getArticlesByCategory = useCallback((category: string) => {
    return articles.filter(a => a.category === category && a.status === 'published')
  }, [articles])

  const getFAQsByCategory = useCallback((category: string) => {
    return faqs.filter(f => f.category === category && f.isPublished).sort((a, b) => a.order - b.order)
  }, [faqs])

  const createArticle = useCallback(async (data: Partial<HelpArticle>) => {
    const article: HelpArticle = {
      id: `art-${Date.now()}`,
      title: data.title || '',
      slug: data.slug || data.title?.toLowerCase().replace(/\s+/g, '-') || '',
      content: data.content || '',
      excerpt: data.excerpt || '',
      category: data.category || 'General',
      tags: data.tags || [],
      status: 'draft',
      views: 0,
      helpful: 0,
      notHelpful: 0,
      authorId: 'user-1',
      authorName: 'You',
      relatedArticles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as HelpArticle
    setArticles(prev => [article, ...prev])
    return { success: true, article }
  }, [])

  const updateArticle = useCallback(async (articleId: string, updates: Partial<HelpArticle>) => {
    setArticles(prev => prev.map(a => a.id === articleId ? {
      ...a,
      ...updates,
      updatedAt: new Date().toISOString()
    } : a))
    return { success: true }
  }, [])

  const publishArticle = useCallback(async (articleId: string) => {
    setArticles(prev => prev.map(a => a.id === articleId ? {
      ...a,
      status: 'published' as const,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : a))
    return { success: true }
  }, [])

  const unpublishArticle = useCallback(async (articleId: string) => {
    setArticles(prev => prev.map(a => a.id === articleId ? {
      ...a,
      status: 'draft' as const,
      updatedAt: new Date().toISOString()
    } : a))
    return { success: true }
  }, [])

  const archiveArticle = useCallback(async (articleId: string) => {
    setArticles(prev => prev.map(a => a.id === articleId ? {
      ...a,
      status: 'archived' as const,
      updatedAt: new Date().toISOString()
    } : a))
    return { success: true }
  }, [])

  const deleteArticle = useCallback(async (articleId: string) => {
    setArticles(prev => prev.filter(a => a.id !== articleId))
    return { success: true }
  }, [])

  const trackArticleView = useCallback(async (articleId: string) => {
    setArticles(prev => prev.map(a => a.id === articleId ? {
      ...a,
      views: a.views + 1
    } : a))
  }, [])

  const rateArticle = useCallback(async (articleId: string, helpful: boolean) => {
    setArticles(prev => prev.map(a => a.id === articleId ? {
      ...a,
      helpful: helpful ? a.helpful + 1 : a.helpful,
      notHelpful: !helpful ? a.notHelpful + 1 : a.notHelpful
    } : a))
    return { success: true }
  }, [])

  const createFAQ = useCallback(async (data: Partial<FAQ>) => {
    const faq: FAQ = {
      id: `faq-${Date.now()}`,
      question: data.question || '',
      answer: data.answer || '',
      category: data.category || 'General',
      order: data.order || faqs.filter(f => f.category === data.category).length + 1,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setFAQs(prev => [...prev, faq])
    return { success: true, faq }
  }, [faqs])

  const updateFAQ = useCallback(async (faqId: string, updates: Partial<FAQ>) => {
    setFAQs(prev => prev.map(f => f.id === faqId ? {
      ...f,
      ...updates,
      updatedAt: new Date().toISOString()
    } : f))
    return { success: true }
  }, [])

  const deleteFAQ = useCallback(async (faqId: string) => {
    setFAQs(prev => prev.filter(f => f.id !== faqId))
    return { success: true }
  }, [])

  const rateFAQ = useCallback(async (faqId: string, helpful: boolean) => {
    setFAQs(prev => prev.map(f => f.id === faqId ? {
      ...f,
      helpful: helpful ? f.helpful + 1 : f.helpful,
      notHelpful: !helpful ? f.notHelpful + 1 : f.notHelpful
    } : f))
    return { success: true }
  }, [])

  const submitContactForm = useCallback(async (data: Omit<ContactForm, 'id' | 'status' | 'createdAt'>) => {
    // In real implementation, this would send to API
    return { success: true, ticketNumber: `TKT-${Date.now()}` }
  }, [])

  const createCategory = useCallback(async (data: Partial<HelpCategory>) => {
    const category: HelpCategory = {
      id: `cat-${Date.now()}`,
      name: data.name || '',
      slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || '',
      description: data.description,
      icon: data.icon,
      color: data.color || '#3b82f6',
      order: data.order || categories.length + 1,
      articleCount: 0,
      subcategories: []
    }
    setCategories(prev => [...prev, category])
    return { success: true, category }
  }, [categories.length])

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<HelpCategory>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c))
    return { success: true }
  }, [])

  const deleteCategory = useCallback(async (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId))
    return { success: true }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchHelpData()
  }, [fetchHelpData])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const publishedArticles = useMemo(() => articles.filter(a => a.status === 'published'), [articles])
  const draftArticles = useMemo(() => articles.filter(a => a.status === 'draft'), [articles])
  const archivedArticles = useMemo(() => articles.filter(a => a.status === 'archived'), [articles])
  const publishedFAQs = useMemo(() => faqs.filter(f => f.isPublished), [faqs])
  const popularArticles = useMemo(() => [...publishedArticles].sort((a, b) => b.views - a.views).slice(0, 10), [publishedArticles])
  const recentArticles = useMemo(() => [...publishedArticles].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()).slice(0, 10), [publishedArticles])

  return {
    articles, categories, faqs, currentArticle, searchResults, stats,
    publishedArticles, draftArticles, archivedArticles, publishedFAQs,
    popularArticles, recentArticles,
    isLoading, isSearching, error,
    refresh, search, getArticleBySlug, getArticlesByCategory, getFAQsByCategory,
    createArticle, updateArticle, publishArticle, unpublishArticle, archiveArticle, deleteArticle,
    trackArticleView, rateArticle,
    createFAQ, updateFAQ, deleteFAQ, rateFAQ,
    submitContactForm, createCategory, updateCategory, deleteCategory,
    setCurrentArticle
  }
}

export default useHelpDesk
