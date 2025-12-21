/**
 * React Hook for Semantic Search
 *
 * Uses Supabase 2025 Vector Buckets for AI-powered search
 */

'use client'

import { useState, useCallback } from 'react'
import {
  searchDocuments,
  searchMessages,
  globalSemanticSearch,
  findSimilarProjects,
  type SearchResult,
  type SemanticSearchOptions,
} from '@/lib/supabase/vector-buckets'

export interface UseSemanticSearchOptions {
  threshold?: number
  limit?: number
  logSearch?: boolean
}

export interface UseSemanticSearchReturn {
  results: SearchResult[]
  isSearching: boolean
  error: string | null
  search: (query: string, options?: SemanticSearchOptions) => Promise<void>
  searchDocuments: (query: string) => Promise<void>
  searchMessages: (query: string, chatId?: string) => Promise<void>
  searchGlobal: (query: string) => Promise<void>
  findSimilar: (projectId: string) => Promise<void>
  clearResults: () => void
}

export function useSemanticSearch(
  userId?: string,
  options: UseSemanticSearchOptions = {}
): UseSemanticSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { threshold = 0.7, limit = 10, logSearch = true } = options

  const handleSearch = useCallback(
    async (searchFn: () => Promise<SearchResult[]>) => {
      setIsSearching(true)
      setError(null)

      try {
        const data = await searchFn()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    []
  )

  const search = useCallback(
    async (query: string, searchOptions?: SemanticSearchOptions) => {
      await handleSearch(() =>
        globalSemanticSearch({
          query,
          userId,
          threshold: searchOptions?.threshold || threshold,
          limit: searchOptions?.limit || limit,
          logSearch,
        })
      )
    },
    [userId, threshold, limit, logSearch, handleSearch]
  )

  const searchDocs = useCallback(
    async (query: string) => {
      await handleSearch(() =>
        searchDocuments({
          query,
          userId,
          threshold,
          limit,
          logSearch,
        })
      )
    },
    [userId, threshold, limit, logSearch, handleSearch]
  )

  const searchMsgs = useCallback(
    async (query: string, chatId?: string) => {
      await handleSearch(() =>
        searchMessages({
          query,
          userId,
          chatId,
          threshold,
          limit,
          logSearch,
        })
      )
    },
    [userId, threshold, limit, logSearch, handleSearch]
  )

  const searchGlobal = useCallback(
    async (query: string) => {
      await handleSearch(() =>
        globalSemanticSearch({
          query,
          userId,
          threshold,
          limit,
          logSearch,
        })
      )
    },
    [userId, threshold, limit, logSearch, handleSearch]
  )

  const findSimilar = useCallback(
    async (projectId: string) => {
      await handleSearch(() => findSimilarProjects(projectId, userId, limit))
    },
    [userId, limit, handleSearch]
  )

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    isSearching,
    error,
    search,
    searchDocuments: searchDocs,
    searchMessages: searchMsgs,
    searchGlobal,
    findSimilar,
    clearResults,
  }
}

/**
 * Hook for embedding documents
 */
export function useDocumentEmbedding() {
  const [isEmbedding, setIsEmbedding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const embedDocument = useCallback(
    async (
      userId: string,
      sourceType: 'file' | 'document' | 'message' | 'project' | 'task' | 'note',
      sourceId: string,
      content: string,
      metadata?: Record<string, unknown>
    ) => {
      setIsEmbedding(true)
      setError(null)

      try {
        const { upsertDocumentEmbedding } = await import('@/lib/supabase/vector-buckets')
        const result = await upsertDocumentEmbedding({
          userId,
          sourceType,
          sourceId,
          content,
          metadata,
        })
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Embedding failed')
        throw err
      } finally {
        setIsEmbedding(false)
      }
    },
    []
  )

  const deleteEmbedding = useCallback(
    async (sourceType: string, sourceId: string) => {
      try {
        const { deleteDocumentEmbeddings } = await import('@/lib/supabase/vector-buckets')
        await deleteDocumentEmbeddings(sourceType, sourceId)
        return { success: true }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed')
        throw err
      }
    },
    []
  )

  return {
    embedDocument,
    deleteEmbedding,
    isEmbedding,
    error,
  }
}
