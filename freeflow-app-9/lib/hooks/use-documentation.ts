'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type DocStatus = 'published' | 'draft' | 'review' | 'archived'
export type DocType = 'guide' | 'api-reference' | 'tutorial' | 'concept' | 'quickstart' | 'troubleshooting'
export type DocCategory = 'getting-started' | 'features' | 'integrations' | 'api' | 'sdk' | 'advanced'

export interface Documentation {
  id: string
  user_id: string
  title: string
  description: string | null
  content: string | null
  status: DocStatus
  doc_type: DocType
  category: DocCategory
  author: string | null
  version: string
  views_count: number
  likes_count: number
  comments_count: number
  helpful_count: number
  not_helpful_count: number
  read_time: number
  contributors_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DocumentationStats {
  total: number
  published: number
  draft: number
  review: number
  totalViews: number
  avgHelpfulRate: number
}

export interface CreateDocumentationInput {
  title: string
  description?: string | null
  content?: string | null
  status?: DocStatus
  doc_type?: DocType
  category?: DocCategory
  author?: string | null
  version?: string
  tags?: string[]
}

export interface UpdateDocumentationInput extends Partial<CreateDocumentationInput> {
  views_count?: number
  likes_count?: number
  helpful_count?: number
  not_helpful_count?: number
}

interface UseDocumentationCRUDOptions {
  status?: DocStatus | 'all'
  doc_type?: DocType | 'all'
  category?: DocCategory | 'all'
  limit?: number
}

/**
 * Hook for Documentation CRUD operations with real-time updates
 * Table: documentation
 */
export function useDocumentationCRUD(options: UseDocumentationCRUDOptions = {}) {
  const [docs, setDocs] = useState<Documentation[]>([])
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const { status, doc_type, category, limit } = options

  // Fetch documentation
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase.from('documentation').select('*')

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }
      if (doc_type && doc_type !== 'all') {
        query = query.eq('doc_type', doc_type)
      }
      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      query = query.order('updated_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError
      setDocs(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch documentation'))
    } finally {
      setLoading(false)
    }
  }, [supabase, status, doc_type, category, limit])

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchDocs()

    const channel = supabase
      .channel('documentation_crud_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documentation' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDocs(prev => [payload.new as Documentation, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setDocs(prev => prev.map(d => d.id === payload.new.id ? payload.new as Documentation : d))
        } else if (payload.eventType === 'DELETE') {
          setDocs(prev => prev.filter(d => d.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchDocs])

  // Create documentation
  const createDoc = async (input: CreateDocumentationInput): Promise<Documentation | null> => {
    try {
      setMutating(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const docData = {
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        content: input.content || null,
        status: input.status || 'draft',
        doc_type: input.doc_type || 'guide',
        category: input.category || 'getting-started',
        author: input.author || user.email || null,
        version: input.version || 'v1.0',
        tags: input.tags || [],
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        helpful_count: 0,
        not_helpful_count: 0,
        read_time: 5,
        contributors_count: 1
      }

      const { data, error } = await supabase
        .from('documentation')
        .insert(docData)
        .select()
        .single()

      if (error) throw error

      toast.success('Documentation created successfully')
      return data as Documentation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create documentation')
      toast.error(error.message)
      setError(error)
      return null
    } finally {
      setMutating(false)
    }
  }

  // Update documentation
  const updateDoc = async (id: string, input: UpdateDocumentationInput): Promise<Documentation | null> => {
    try {
      setMutating(true)

      const { data, error } = await supabase
        .from('documentation')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Documentation updated successfully')
      return data as Documentation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update documentation')
      toast.error(error.message)
      setError(error)
      return null
    } finally {
      setMutating(false)
    }
  }

  // Delete documentation (hard delete - no deleted_at column in this table)
  const deleteDoc = async (id: string): Promise<boolean> => {
    try {
      setMutating(true)

      const { error } = await supabase
        .from('documentation')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Documentation deleted successfully')
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete documentation')
      toast.error(error.message)
      setError(error)
      return false
    } finally {
      setMutating(false)
    }
  }

  // Publish documentation
  const publishDoc = async (id: string): Promise<Documentation | null> => {
    return updateDoc(id, { status: 'published' })
  }

  // Archive documentation
  const archiveDoc = async (id: string): Promise<Documentation | null> => {
    return updateDoc(id, { status: 'archived' })
  }

  // Increment view count
  const incrementViews = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('increment_doc_views', { doc_id: id })
      if (error) {
        // Fallback to manual increment if RPC doesn't exist
        const doc = docs.find(d => d.id === id)
        if (doc) {
          await updateDoc(id, { views_count: doc.views_count + 1 })
        }
      }
      return true
    } catch {
      return false
    }
  }

  // Toggle like
  const toggleLike = async (id: string, liked: boolean): Promise<boolean> => {
    try {
      setMutating(true)
      const doc = docs.find(d => d.id === id)
      if (!doc) return false

      const newLikesCount = liked ? doc.likes_count + 1 : Math.max(0, doc.likes_count - 1)

      await supabase
        .from('documentation')
        .update({ likes_count: newLikesCount })
        .eq('id', id)

      toast.success(liked ? 'Liked!' : 'Like removed')
      return true
    } catch {
      toast.error('Failed to update like')
      return false
    } finally {
      setMutating(false)
    }
  }

  // Submit feedback (helpful/not helpful)
  const submitFeedback = async (id: string, helpful: boolean): Promise<boolean> => {
    try {
      setMutating(true)
      const doc = docs.find(d => d.id === id)
      if (!doc) return false

      const updates = helpful
        ? { helpful_count: doc.helpful_count + 1 }
        : { not_helpful_count: doc.not_helpful_count + 1 }

      await supabase
        .from('documentation')
        .update(updates)
        .eq('id', id)

      toast.success('Thank you for your feedback!')
      return true
    } catch {
      toast.error('Failed to submit feedback')
      return false
    } finally {
      setMutating(false)
    }
  }

  // Calculate stats
  const stats: DocumentationStats = {
    total: docs.length,
    published: docs.filter(d => d.status === 'published').length,
    draft: docs.filter(d => d.status === 'draft').length,
    review: docs.filter(d => d.status === 'review').length,
    totalViews: docs.reduce((sum, d) => sum + (d.views_count || 0), 0),
    avgHelpfulRate: docs.length > 0
      ? docs.reduce((sum, d) => {
          const total = (d.helpful_count || 0) + (d.not_helpful_count || 0)
          return sum + (total > 0 ? (d.helpful_count || 0) / total : 0)
        }, 0) / docs.length * 100
      : 0
  }

  return {
    docs,
    stats,
    loading,
    mutating,
    error,
    refetch: fetchDocs,
    createDoc,
    updateDoc,
    deleteDoc,
    publishDoc,
    archiveDoc,
    incrementViews,
    toggleLike,
    submitFeedback
  }
}

// Legacy hook for backwards compatibility
export function useDocumentation(initialDocs: Documentation[], initialStats: DocumentationStats) {
  const [docs, setDocs] = useState<Documentation[]>(initialDocs)
  const [stats, setStats] = useState<DocumentationStats>(initialStats)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('documentation_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documentation' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDocs(prev => [payload.new as Documentation, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setDocs(prev => prev.map(d => d.id === payload.new.id ? payload.new as Documentation : d))
        } else if (payload.eventType === 'DELETE') {
          setDocs(prev => prev.filter(d => d.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => {
    const published = docs.filter(d => d.status === 'published').length
    const draft = docs.filter(d => d.status === 'draft').length
    const review = docs.filter(d => d.status === 'review').length
    const totalViews = docs.reduce((sum, d) => sum + (d.views_count || 0), 0)
    const avgHelpfulRate = docs.length > 0
      ? docs.reduce((sum, d) => {
          const total = (d.helpful_count || 0) + (d.not_helpful_count || 0)
          return sum + (total > 0 ? (d.helpful_count || 0) / total : 0)
        }, 0) / docs.length * 100
      : 0

    setStats({
      total: docs.length,
      published,
      draft,
      review,
      totalViews,
      avgHelpfulRate
    })
  }, [docs])

  return { docs, stats }
}
