'use client'

/**
 * useVersionHistory - React hook for document version management
 *
 * Features:
 * - Fetch version history for a document
 * - Create checkpoints/snapshots
 * - Restore to previous versions
 * - Compare versions
 * - Track version metadata
 *
 * Required by A+++ Implementation Guide Phase 1.
 */

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface DocumentVersion {
  id: string
  version_number: number
  document_id: string
  created_by: string
  created_at: string
  label?: string
  description?: string
  content_snapshot: string
  word_count: number
  change_summary?: string
  is_auto_save: boolean
  is_checkpoint: boolean
  session_id?: string
  metadata?: Record<string, any>
  author?: {
    id: string
    name: string
    avatar?: string
    email?: string
  }
}

export interface VersionHistoryState {
  versions: DocumentVersion[]
  currentVersion: DocumentVersion | null
  isLoading: boolean
  error: string | null
  totalVersions: number
  checkpointCount: number
}

export interface UseVersionHistoryOptions {
  documentId: string
  autoFetch?: boolean
  limit?: number
}

export interface UseVersionHistoryReturn extends VersionHistoryState {
  // Fetch operations
  fetchVersions: () => Promise<void>
  fetchVersion: (versionId: string) => Promise<DocumentVersion | null>

  // Create operations
  createCheckpoint: (label: string, description?: string, content?: string) => Promise<DocumentVersion | null>
  saveAutoVersion: (content: string, changeSummary?: string) => Promise<DocumentVersion | null>

  // Restore operations
  restoreVersion: (versionId: string) => Promise<boolean>

  // Compare operations
  compareVersions: (versionId1: string, versionId2: string) => Promise<{
    additions: string[]
    deletions: string[]
    changes: string[]
  } | null>

  // Utility
  getVersionByNumber: (versionNumber: number) => DocumentVersion | undefined
  getLatestCheckpoint: () => DocumentVersion | undefined
  refresh: () => Promise<void>
}

// ============================================================================
// API Helper
// ============================================================================

async function callVersionAPI(
  action: string,
  data?: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const method = action.startsWith('get') || action === 'versions' ? 'GET' : 'POST'

    if (method === 'GET') {
      const params = new URLSearchParams({ action, ...data })
      const response = await fetch(`/api/collaboration/sessions?${params}`)
      return await response.json()
    }

    const response = await fetch('/api/collaboration/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    })

    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function useVersionHistory({
  documentId,
  autoFetch = true,
  limit = 50,
}: UseVersionHistoryOptions): UseVersionHistoryReturn {
  const [state, setState] = useState<VersionHistoryState>({
    versions: [],
    currentVersion: null,
    isLoading: false,
    error: null,
    totalVersions: 0,
    checkpointCount: 0,
  })

  // Fetch all versions
  const fetchVersions = useCallback(async () => {
    if (!documentId) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await callVersionAPI('versions', { documentId, limit: limit.toString() })

      if (result.success) {
        const versions = result.data?.versions || result.versions || []
        const checkpoints = versions.filter((v: DocumentVersion) => v.is_checkpoint)

        setState({
          versions,
          currentVersion: versions[0] || null,
          isLoading: false,
          error: null,
          totalVersions: versions.length,
          checkpointCount: checkpoints.length,
        })
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to fetch versions',
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [documentId, limit])

  // Initial fetch
  useEffect(() => {
    if (autoFetch && documentId) {
      fetchVersions()
    }
  }, [autoFetch, documentId, fetchVersions])

  // Fetch single version
  const fetchVersion = useCallback(async (versionId: string): Promise<DocumentVersion | null> => {
    try {
      const result = await callVersionAPI('get-version', { versionId })
      return result.success ? result.data?.version : null
    } catch {
      return null
    }
  }, [])

  // Create checkpoint
  const createCheckpoint = useCallback(async (
    label: string,
    description?: string,
    content?: string
  ): Promise<DocumentVersion | null> => {
    try {
      const result = await callVersionAPI('save-version', {
        documentId,
        label,
        description,
        contentSnapshot: content,
        isCheckpoint: true,
      })

      if (result.success && result.version) {
        // Refresh the list
        await fetchVersions()
        return result.version
      }

      return null
    } catch {
      return null
    }
  }, [documentId, fetchVersions])

  // Save auto-version
  const saveAutoVersion = useCallback(async (
    content: string,
    changeSummary?: string
  ): Promise<DocumentVersion | null> => {
    try {
      const result = await callVersionAPI('save-version', {
        documentId,
        contentSnapshot: content,
        changeSummary,
        isAutoSave: true,
      })

      if (result.success && result.version) {
        // Update state without full refresh for performance
        setState(prev => ({
          ...prev,
          versions: [result.version, ...prev.versions],
          currentVersion: result.version,
          totalVersions: prev.totalVersions + 1,
        }))
        return result.version
      }

      return null
    } catch {
      return null
    }
  }, [documentId])

  // Restore version
  const restoreVersion = useCallback(async (versionId: string): Promise<boolean> => {
    try {
      const result = await callVersionAPI('restore-version', { versionId })

      if (result.success) {
        await fetchVersions()
        return true
      }

      return false
    } catch {
      return false
    }
  }, [fetchVersions])

  // Compare versions
  const compareVersions = useCallback(async (
    versionId1: string,
    versionId2: string
  ): Promise<{ additions: string[]; deletions: string[]; changes: string[] } | null> => {
    try {
      // Fetch both versions
      const [v1, v2] = await Promise.all([
        fetchVersion(versionId1),
        fetchVersion(versionId2),
      ])

      if (!v1 || !v2) return null

      // Simple line-by-line diff (in production, use a proper diff library)
      const lines1 = (v1.content_snapshot || '').split('\n')
      const lines2 = (v2.content_snapshot || '').split('\n')

      const additions: string[] = []
      const deletions: string[] = []
      const changes: string[] = []

      // Find additions (lines in v2 not in v1)
      lines2.forEach((line, i) => {
        if (!lines1.includes(line)) {
          additions.push(`Line ${i + 1}: ${line}`)
        }
      })

      // Find deletions (lines in v1 not in v2)
      lines1.forEach((line, i) => {
        if (!lines2.includes(line)) {
          deletions.push(`Line ${i + 1}: ${line}`)
        }
      })

      return { additions, deletions, changes }
    } catch {
      return null
    }
  }, [fetchVersion])

  // Get version by number
  const getVersionByNumber = useCallback((versionNumber: number): DocumentVersion | undefined => {
    return state.versions.find(v => v.version_number === versionNumber)
  }, [state.versions])

  // Get latest checkpoint
  const getLatestCheckpoint = useCallback((): DocumentVersion | undefined => {
    return state.versions.find(v => v.is_checkpoint)
  }, [state.versions])

  // Refresh
  const refresh = useCallback(async () => {
    await fetchVersions()
  }, [fetchVersions])

  return {
    ...state,
    fetchVersions,
    fetchVersion,
    createCheckpoint,
    saveAutoVersion,
    restoreVersion,
    compareVersions,
    getVersionByNumber,
    getLatestCheckpoint,
    refresh,
  }
}

export default useVersionHistory
