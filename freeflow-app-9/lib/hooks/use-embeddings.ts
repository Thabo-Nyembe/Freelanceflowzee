/**
 * React Hooks for Vector Embeddings Management
 *
 * Supabase 2025 Feature: Vector Buckets with pgvector
 * Manages document, message, project, and AI content embeddings
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================

export interface DocumentEmbedding {
  id: string
  user_id: string
  source_type: 'file' | 'document' | 'message' | 'project' | 'task' | 'note'
  source_id: string
  content_hash: string
  chunk_index: number
  chunk_text: string | null
  embedding_model: string
  metadata: Record<string, unknown>
  token_count: number | null
  created_at: string
  updated_at: string
}

export interface MessageEmbedding {
  id: string
  user_id: string
  message_id: string
  chat_id: string | null
  embedding_model: string
  content_preview: string | null
  created_at: string
}

export interface ProjectEmbedding {
  id: string
  user_id: string
  project_id: string
  embedding_model: string
  project_type: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface AIContentEmbedding {
  id: string
  user_id: string
  content_type: 'ai_design' | 'ai_text' | 'ai_code' | 'ai_image' | 'ai_video'
  content_id: string
  embedding_model: string
  style_tags: string[]
  created_at: string
}

// ============================================
// DOCUMENT EMBEDDINGS HOOK
// ============================================

export interface UseDocumentEmbeddingsReturn {
  embeddings: DocumentEmbedding[]
  isLoading: boolean
  error: string | null
  create: (data: Partial<DocumentEmbedding>) => Promise<DocumentEmbedding | null>
  update: (id: string, data: Partial<DocumentEmbedding>) => Promise<void>
  remove: (id: string) => Promise<void>
  removeBySource: (sourceType: string, sourceId: string) => Promise<void>
  getBySource: (sourceType: string, sourceId: string) => Promise<DocumentEmbedding[]>
  refresh: () => Promise<void>
}

export function useDocumentEmbeddings(userId?: string): UseDocumentEmbeddingsReturn {
  const [embeddings, setEmbeddings] = useState<DocumentEmbedding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEmbeddings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('document_embeddings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setEmbeddings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load embeddings')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchEmbeddings()

    // Set up realtime subscription
    if (userId) {
      const channel = supabase
        .channel('document_embeddings_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'document_embeddings', filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setEmbeddings(prev => [payload.new as DocumentEmbedding, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setEmbeddings(prev => prev.map(item =>
                (item as Record<string, unknown>).id === payload.new.id ? payload.new as DocumentEmbedding : item
              ))
            } else if (payload.eventType === 'DELETE') {
              setEmbeddings(prev => prev.filter(item => (item as Record<string, unknown>).id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchEmbeddings, userId, supabase])

  const create = useCallback(async (data: Partial<DocumentEmbedding>) => {
    try {
      const { data: result, error: err } = await supabase
        .from('document_embeddings')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (err) throw err
      setEmbeddings(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create embedding')
      return null
    }
  }, [userId, supabase])

  const update = useCallback(async (id: string, data: Partial<DocumentEmbedding>) => {
    try {
      const { error: err } = await supabase
        .from('document_embeddings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (err) throw err
      setEmbeddings(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update embedding')
    }
  }, [supabase])

  const remove = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('document_embeddings')
        .delete()
        .eq('id', id)

      if (err) throw err
      setEmbeddings(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete embedding')
    }
  }, [supabase])

  const removeBySource = useCallback(async (sourceType: string, sourceId: string) => {
    try {
      const { error: err } = await supabase
        .from('document_embeddings')
        .delete()
        .eq('source_type', sourceType)
        .eq('source_id', sourceId)

      if (err) throw err
      setEmbeddings(prev => prev.filter(e =>
        !(e.source_type === sourceType && e.source_id === sourceId)
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete embeddings')
    }
  }, [supabase])

  const getBySource = useCallback(async (sourceType: string, sourceId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('document_embeddings')
        .select('*')
        .eq('source_type', sourceType)
        .eq('source_id', sourceId)
        .order('chunk_index', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get embeddings')
      return []
    }
  }, [supabase])

  return {
    embeddings,
    isLoading,
    error,
    create,
    update,
    remove,
    removeBySource,
    getBySource,
    refresh: fetchEmbeddings,
  }
}

// ============================================
// MESSAGE EMBEDDINGS HOOK
// ============================================

export interface UseMessageEmbeddingsReturn {
  embeddings: MessageEmbedding[]
  isLoading: boolean
  error: string | null
  create: (data: Partial<MessageEmbedding>) => Promise<MessageEmbedding | null>
  remove: (id: string) => Promise<void>
  removeByMessage: (messageId: string) => Promise<void>
  getByChat: (chatId: string) => Promise<MessageEmbedding[]>
  refresh: () => Promise<void>
}

export function useMessageEmbeddings(userId?: string): UseMessageEmbeddingsReturn {
  const [embeddings, setEmbeddings] = useState<MessageEmbedding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEmbeddings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('message_embeddings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setEmbeddings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load embeddings')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchEmbeddings()
  }, [fetchEmbeddings])

  const create = useCallback(async (data: Partial<MessageEmbedding>) => {
    try {
      const { data: result, error: err } = await supabase
        .from('message_embeddings')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (err) throw err
      setEmbeddings(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create embedding')
      return null
    }
  }, [userId, supabase])

  const remove = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('message_embeddings')
        .delete()
        .eq('id', id)

      if (err) throw err
      setEmbeddings(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete embedding')
    }
  }, [supabase])

  const removeByMessage = useCallback(async (messageId: string) => {
    try {
      const { error: err } = await supabase
        .from('message_embeddings')
        .delete()
        .eq('message_id', messageId)

      if (err) throw err
      setEmbeddings(prev => prev.filter(e => e.message_id !== messageId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete embedding')
    }
  }, [supabase])

  const getByChat = useCallback(async (chatId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('message_embeddings')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get embeddings')
      return []
    }
  }, [supabase])

  return {
    embeddings,
    isLoading,
    error,
    create,
    remove,
    removeByMessage,
    getByChat,
    refresh: fetchEmbeddings,
  }
}

// ============================================
// PROJECT EMBEDDINGS HOOK
// ============================================

export interface UseProjectEmbeddingsReturn {
  embeddings: ProjectEmbedding[]
  isLoading: boolean
  error: string | null
  create: (data: Partial<ProjectEmbedding>) => Promise<ProjectEmbedding | null>
  update: (id: string, data: Partial<ProjectEmbedding>) => Promise<void>
  remove: (id: string) => Promise<void>
  getByProject: (projectId: string) => Promise<ProjectEmbedding | null>
  refresh: () => Promise<void>
}

export function useProjectEmbeddings(userId?: string): UseProjectEmbeddingsReturn {
  const [embeddings, setEmbeddings] = useState<ProjectEmbedding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEmbeddings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('project_embeddings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setEmbeddings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load embeddings')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchEmbeddings()
  }, [fetchEmbeddings])

  const create = useCallback(async (data: Partial<ProjectEmbedding>) => {
    try {
      const { data: result, error: err } = await supabase
        .from('project_embeddings')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (err) throw err
      setEmbeddings(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create embedding')
      return null
    }
  }, [userId, supabase])

  const update = useCallback(async (id: string, data: Partial<ProjectEmbedding>) => {
    try {
      const { error: err } = await supabase
        .from('project_embeddings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (err) throw err
      setEmbeddings(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update embedding')
    }
  }, [supabase])

  const remove = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('project_embeddings')
        .delete()
        .eq('id', id)

      if (err) throw err
      setEmbeddings(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete embedding')
    }
  }, [supabase])

  const getByProject = useCallback(async (projectId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('project_embeddings')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (err && err.code !== 'PGRST116') throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get embedding')
      return null
    }
  }, [supabase])

  return {
    embeddings,
    isLoading,
    error,
    create,
    update,
    remove,
    getByProject,
    refresh: fetchEmbeddings,
  }
}

// ============================================
// AI CONTENT EMBEDDINGS HOOK
// ============================================

export interface UseAIContentEmbeddingsReturn {
  embeddings: AIContentEmbedding[]
  isLoading: boolean
  error: string | null
  create: (data: Partial<AIContentEmbedding>) => Promise<AIContentEmbedding | null>
  remove: (id: string) => Promise<void>
  getByContent: (contentType: string, contentId: string) => Promise<AIContentEmbedding | null>
  getByType: (contentType: string) => Promise<AIContentEmbedding[]>
  refresh: () => Promise<void>
}

export function useAIContentEmbeddings(userId?: string): UseAIContentEmbeddingsReturn {
  const [embeddings, setEmbeddings] = useState<AIContentEmbedding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEmbeddings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('ai_content_embeddings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setEmbeddings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load embeddings')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchEmbeddings()
  }, [fetchEmbeddings])

  const create = useCallback(async (data: Partial<AIContentEmbedding>) => {
    try {
      const { data: result, error: err } = await supabase
        .from('ai_content_embeddings')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (err) throw err
      setEmbeddings(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create embedding')
      return null
    }
  }, [userId, supabase])

  const remove = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('ai_content_embeddings')
        .delete()
        .eq('id', id)

      if (err) throw err
      setEmbeddings(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete embedding')
    }
  }, [supabase])

  const getByContent = useCallback(async (contentType: string, contentId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('ai_content_embeddings')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single()

      if (err && err.code !== 'PGRST116') throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get embedding')
      return null
    }
  }, [supabase])

  const getByType = useCallback(async (contentType: string) => {
    try {
      const { data, error: err } = await supabase
        .from('ai_content_embeddings')
        .select('*')
        .eq('content_type', contentType)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get embeddings')
      return []
    }
  }, [userId, supabase])

  return {
    embeddings,
    isLoading,
    error,
    create,
    remove,
    getByContent,
    getByType,
    refresh: fetchEmbeddings,
  }
}
