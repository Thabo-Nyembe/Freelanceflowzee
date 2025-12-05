'use client'

import { useState, useEffect } from 'react'
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

  const loadStorageData = async () => {
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
  }

  useEffect(() => {
    loadStorageData()
  }, [])

  return {
    ...data,
    refresh: loadStorageData
  }
}
