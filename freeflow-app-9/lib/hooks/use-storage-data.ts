'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { StorageFile, StorageConnection } from '@/lib/storage/providers'
import { getStorageConnections, getAllFiles, getTotalStorageQuota } from '@/lib/storage/storage-queries'
import { createClient } from '@/lib/supabase/client'

interface StorageData {
  files: StorageFile[]
  connections: StorageConnection[]
  quota: {
    total: number
    used: number
    available: number
    usagePercentage: number
  }
  loading: boolean
  error: string | null
}

export function useStorageData() {
  const [data, setData] = useState<StorageData>({
    files: [],
    connections: [],
    quota: {
      total: 0,
      used: 0,
      available: 0,
      usagePercentage: 0
    },
    loading: true,
    error: null
  })
  const supabase = createClientComponentClient()

  const loadStorageData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Load data in parallel
      const [connections, files, quota] = await Promise.all([
        getStorageConnections(user.id),
        getAllFiles(user.id),
        getTotalStorageQuota(user.id)
      ])

      setData({
        files,
        connections,
        quota,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error loading storage data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load storage data'
      }))
    }
  }, [])

  useEffect(() => {
    loadStorageData()
  }, [loadStorageData])

  // Realtime subscription for storage updates
  useEffect(() => {
    const channel = supabase
      .channel('storage-data-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'files' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => ({
              ...prev,
              files: [payload.new as StorageFile, ...prev.files]
            }))
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => ({
              ...prev,
              files: prev.files.map(f =>
                (f as any).id === (payload.new as any).id ? payload.new as StorageFile : f
              )
            }))
          } else if (payload.eventType === 'DELETE') {
            setData(prev => ({
              ...prev,
              files: prev.files.filter(f => (f as any).id !== (payload.old as any).id)
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'storage_connections' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => ({
              ...prev,
              connections: [...prev.connections, payload.new as StorageConnection]
            }))
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => ({
              ...prev,
              connections: prev.connections.map(c =>
                (c as any).id === (payload.new as any).id ? payload.new as StorageConnection : c
              )
            }))
          } else if (payload.eventType === 'DELETE') {
            setData(prev => ({
              ...prev,
              connections: prev.connections.filter(c => (c as any).id !== (payload.old as any).id)
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return {
    ...data,
    refresh: loadStorageData
  }
}
