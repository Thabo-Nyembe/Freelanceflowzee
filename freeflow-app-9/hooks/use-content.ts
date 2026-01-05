'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ContentType = 'page' | 'post' | 'article' | 'news' | 'announcement' | 'faq' | 'guide' | 'case_study'
export type ContentStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived'
export type ContentVisibility = 'public' | 'private' | 'password' | 'members'

export interface Content {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  htmlContent?: string
  type: ContentType
  status: ContentStatus
  visibility: ContentVisibility
  password?: string
  featuredImage?: string
  author: ContentAuthor
  coAuthors: ContentAuthor[]
  categoryId?: string
  categoryName?: string
  tags: string[]
  seo: ContentSEO
  metadata?: Record<string, any>
  viewCount: number
  likeCount: number
  commentCount: number
  readTime: number
  isFeatured: boolean
  isPinned: boolean
  allowComments: boolean
  publishedAt?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContentAuthor {
  id: string
  name: string
  avatar?: string
  bio?: string
}

export interface ContentSEO {
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  canonicalUrl?: string
  ogImage?: string
  noIndex?: boolean
}

export interface ContentCategory {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  contentCount: number
  order: number
  createdAt: string
}

export interface ContentComment {
  id: string
  contentId: string
  parentId?: string
  author: ContentAuthor
  text: string
  isApproved: boolean
  likeCount: number
  replies?: ContentComment[]
  createdAt: string
  updatedAt: string
}

export interface ContentStats {
  totalContent: number
  publishedContent: number
  draftContent: number
  totalViews: number
  totalLikes: number
  totalComments: number
  contentByType: Record<string, number>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockContent: Content[] = [
  { id: 'content-1', title: 'Getting Started with Our Platform', slug: 'getting-started', excerpt: 'Learn how to get started with our platform in just a few minutes.', content: '# Getting Started\n\nWelcome to our platform! This guide will help you...', type: 'guide', status: 'published', visibility: 'public', author: { id: 'user-1', name: 'Alex Chen', bio: 'Product Lead' }, coAuthors: [], tags: ['tutorial', 'getting-started'], seo: { metaTitle: 'Getting Started Guide', metaDescription: 'Complete guide to getting started with our platform' }, viewCount: 2450, likeCount: 156, commentCount: 23, readTime: 5, isFeatured: true, isPinned: true, allowComments: true, publishedAt: '2024-01-15', createdAt: '2024-01-10', updatedAt: '2024-03-01' },
  { id: 'content-2', title: 'Product Update: New Features in March', slug: 'product-update-march-2024', excerpt: 'Discover all the new features we launched this month.', content: '# March 2024 Product Update\n\nWe are excited to announce...', type: 'news', status: 'published', visibility: 'public', featuredImage: '/content/march-update.jpg', author: { id: 'user-2', name: 'Sarah Miller', bio: 'Marketing Manager' }, coAuthors: [], categoryId: 'ccat-1', categoryName: 'Product Updates', tags: ['product', 'features', 'updates'], seo: { metaTitle: 'March 2024 Product Update', metaDescription: 'All new features released in March 2024' }, viewCount: 890, likeCount: 78, commentCount: 12, readTime: 3, isFeatured: false, isPinned: false, allowComments: true, publishedAt: '2024-03-15', createdAt: '2024-03-10', updatedAt: '2024-03-15' },
  { id: 'content-3', title: 'How We Helped Company X Increase Productivity', slug: 'case-study-company-x', excerpt: 'Learn how Company X achieved 50% productivity gains.', content: '# Case Study: Company X\n\nBackground...', type: 'case_study', status: 'published', visibility: 'public', featuredImage: '/content/case-study-x.jpg', author: { id: 'user-2', name: 'Sarah Miller' }, coAuthors: [{ id: 'user-1', name: 'Alex Chen' }], categoryId: 'ccat-2', categoryName: 'Case Studies', tags: ['case-study', 'productivity', 'enterprise'], seo: {}, viewCount: 560, likeCount: 45, commentCount: 8, readTime: 8, isFeatured: true, isPinned: false, allowComments: false, publishedAt: '2024-02-20', createdAt: '2024-02-15', updatedAt: '2024-02-20' },
  { id: 'content-4', title: 'FAQ: Common Questions', slug: 'faq', content: '# Frequently Asked Questions\n\n## How do I...', type: 'faq', status: 'draft', visibility: 'public', author: { id: 'user-1', name: 'Alex Chen' }, coAuthors: [], tags: ['faq', 'support'], seo: {}, viewCount: 0, likeCount: 0, commentCount: 0, readTime: 10, isFeatured: false, isPinned: false, allowComments: false, createdAt: '2024-03-18', updatedAt: '2024-03-18' }
]

const mockCategories: ContentCategory[] = [
  { id: 'ccat-1', name: 'Product Updates', slug: 'product-updates', description: 'Latest product news and updates', contentCount: 12, order: 1, createdAt: '2024-01-01' },
  { id: 'ccat-2', name: 'Case Studies', slug: 'case-studies', description: 'Customer success stories', contentCount: 8, order: 2, createdAt: '2024-01-01' },
  { id: 'ccat-3', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides', contentCount: 15, order: 3, createdAt: '2024-01-01' }
]

const mockComments: ContentComment[] = [
  { id: 'comment-1', contentId: 'content-1', author: { id: 'user-3', name: 'Mike Johnson' }, text: 'Great guide! Very helpful.', isApproved: true, likeCount: 5, createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: 'comment-2', contentId: 'content-1', author: { id: 'user-4', name: 'Emily Davis' }, text: 'Thanks for this comprehensive overview!', isApproved: true, likeCount: 3, createdAt: '2024-03-02', updatedAt: '2024-03-02' }
]

const mockStats: ContentStats = {
  totalContent: 35,
  publishedContent: 28,
  draftContent: 7,
  totalViews: 45600,
  totalLikes: 1890,
  totalComments: 345,
  contentByType: { guide: 8, news: 12, case_study: 5, faq: 3, post: 7 }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseContentOptions {
  
  type?: ContentType
  categoryId?: string
}

export function useContent(options: UseContentOptions = {}) {
  const {  type, categoryId } = options

  const [contents, setContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [comments, setComments] = useState<ContentComment[]>([])
  const [currentContent, setCurrentContent] = useState<Content | null>(null)
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchContent = useCallback(async (filters?: { type?: string; categoryId?: string; status?: string; search?: string; tag?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type || type) params.set('type', filters?.type || type || '')
      if (filters?.categoryId || categoryId) params.set('categoryId', filters?.categoryId || categoryId || '')
      if (filters?.status) params.set('status', filters.status)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.tag) params.set('tag', filters.tag)

      const response = await fetch(`/api/content?${params}`)
      const result = await response.json()
      if (result.success) {
        setContents(Array.isArray(result.contents) ? result.contents : [])
        setCategories(Array.isArray(result.categories) ? result.categories : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.contents
      }
      setContents(mockContent)
      setCategories(mockCategories)
      setStats(null)
      return []
    } catch (err) {
      setContents(mockContent)
      setCategories(mockCategories)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ type, categoryId])

  const createContent = useCallback(async (data: { title: string; content: string; type: ContentType; categoryId?: string; tags?: string[]; visibility?: ContentVisibility }) => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setContents(prev => [result.content, ...prev])
        return { success: true, content: result.content }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const wordCount = data.content.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)
      const category = categories.find(c => c.id === data.categoryId)
      const newContent: Content = {
        id: `content-${Date.now()}`,
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        content: data.content,
        type: data.type,
        status: 'draft',
        visibility: data.visibility || 'public',
        author: { id: 'user-1', name: 'You' },
        coAuthors: [],
        categoryId: data.categoryId,
        categoryName: category?.name,
        tags: data.tags || [],
        seo: {},
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        readTime,
        isFeatured: false,
        isPinned: false,
        allowComments: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setContents(prev => [newContent, ...prev])
      return { success: true, content: newContent }
    }
  }, [categories])

  const updateContent = useCallback(async (contentId: string, updates: Partial<Content>) => {
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setContents(prev => prev.map(c => c.id === contentId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
      }
      return result
    } catch (err) {
      setContents(prev => prev.map(c => c.id === contentId ? { ...c, ...updates } : c))
      return { success: true }
    }
  }, [])

  const deleteContent = useCallback(async (contentId: string) => {
    try {
      await fetch(`/api/content/${contentId}`, { method: 'DELETE' })
      setContents(prev => prev.filter(c => c.id !== contentId))
      return { success: true }
    } catch (err) {
      setContents(prev => prev.filter(c => c.id !== contentId))
      return { success: true }
    }
  }, [])

  const publishContent = useCallback(async (contentId: string) => {
    return updateContent(contentId, { status: 'published', publishedAt: new Date().toISOString() })
  }, [updateContent])

  const unpublishContent = useCallback(async (contentId: string) => {
    return updateContent(contentId, { status: 'draft', publishedAt: undefined })
  }, [updateContent])

  const scheduleContent = useCallback(async (contentId: string, scheduledAt: string) => {
    return updateContent(contentId, { status: 'scheduled', scheduledAt })
  }, [updateContent])

  const archiveContent = useCallback(async (contentId: string) => {
    return updateContent(contentId, { status: 'archived' })
  }, [updateContent])

  const duplicateContent = useCallback(async (contentId: string) => {
    const original = contents.find(c => c.id === contentId)
    if (!original) return { success: false, error: 'Content not found' }

    const duplicate: Content = {
      ...original,
      id: `content-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      publishedAt: undefined,
      scheduledAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setContents(prev => [duplicate, ...prev])
    return { success: true, content: duplicate }
  }, [contents])

  const recordView = useCallback(async (contentId: string) => {
    setContents(prev => prev.map(c => c.id === contentId ? { ...c, viewCount: c.viewCount + 1 } : c))
  }, [])

  const likeContent = useCallback(async (contentId: string) => {
    setContents(prev => prev.map(c => c.id === contentId ? { ...c, likeCount: c.likeCount + 1 } : c))
    return { success: true }
  }, [])

  const toggleFeatured = useCallback(async (contentId: string) => {
    const content = contents.find(c => c.id === contentId)
    if (content) {
      return updateContent(contentId, { isFeatured: !content.isFeatured })
    }
    return { success: false }
  }, [contents, updateContent])

  const togglePinned = useCallback(async (contentId: string) => {
    const content = contents.find(c => c.id === contentId)
    if (content) {
      return updateContent(contentId, { isPinned: !content.isPinned })
    }
    return { success: false }
  }, [contents, updateContent])

  const fetchComments = useCallback(async (contentId: string) => {
    try {
      const response = await fetch(`/api/content/${contentId}/comments`)
      const result = await response.json()
      if (result.success) {
        setComments(result.comments || [])
        return result.comments
      }
      return []
    } catch (err) {
      const filtered = mockComments.filter(c => c.contentId === contentId)
      setComments(filtered)
      return filtered
    }
  }, [])

  const addComment = useCallback(async (contentId: string, text: string, parentId?: string) => {
    const newComment: ContentComment = {
      id: `comment-${Date.now()}`,
      contentId,
      parentId,
      author: { id: 'user-1', name: 'You' },
      text,
      isApproved: true,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setComments(prev => [newComment, ...prev])
    setContents(prev => prev.map(c => c.id === contentId ? { ...c, commentCount: c.commentCount + 1 } : c))
    return { success: true, comment: newComment }
  }, [])

  const deleteComment = useCallback(async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (comment) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setContents(prev => prev.map(c => c.id === comment.contentId ? { ...c, commentCount: Math.max(0, c.commentCount - 1) } : c))
    }
    return { success: true }
  }, [comments])

  const getContentBySlug = useCallback((slug: string): Content | null => {
    return contents.find(c => c.slug === slug) || null
  }, [contents])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchContent({ search: query })
  }, [fetchContent])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchContent()
  }, [fetchContent])

  useEffect(() => { refresh() }, [refresh])

  const publishedContent = useMemo(() => contents.filter(c => c.status === 'published'), [contents])
  const draftContent = useMemo(() => contents.filter(c => c.status === 'draft'), [contents])
  const scheduledContent = useMemo(() => contents.filter(c => c.status === 'scheduled'), [contents])
  const featuredContent = useMemo(() => publishedContent.filter(c => c.isFeatured), [publishedContent])
  const pinnedContent = useMemo(() => publishedContent.filter(c => c.isPinned), [publishedContent])
  const contentByCategory = useMemo(() => {
    const grouped: Record<string, Content[]> = {}
    contents.forEach(c => {
      const key = c.categoryId || 'uncategorized'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(c)
    })
    return grouped
  }, [contents])
  const contentByType = useMemo(() => {
    const grouped: Record<string, Content[]> = {}
    contents.forEach(c => {
      if (!grouped[c.type]) grouped[c.type] = []
      grouped[c.type].push(c)
    })
    return grouped
  }, [contents])
  const popularContent = useMemo(() => [...publishedContent].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10), [publishedContent])
  const recentContent = useMemo(() => [...publishedContent].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()).slice(0, 10), [publishedContent])
  const allTags = useMemo(() => [...new Set(contents.flatMap(c => c.tags))].sort(), [contents])
  const contentTypes: ContentType[] = ['page', 'post', 'article', 'news', 'announcement', 'faq', 'guide', 'case_study']

  return {
    contents, categories, comments, currentContent, stats, publishedContent, draftContent, scheduledContent,
    featuredContent, pinnedContent, contentByCategory, contentByType, popularContent, recentContent, allTags, contentTypes,
    isLoading, error, searchQuery,
    refresh, fetchContent, createContent, updateContent, deleteContent, publishContent, unpublishContent, scheduleContent,
    archiveContent, duplicateContent, recordView, likeContent, toggleFeatured, togglePinned,
    fetchComments, addComment, deleteComment, getContentBySlug, search,
    setCurrentContent
  }
}

export default useContent
