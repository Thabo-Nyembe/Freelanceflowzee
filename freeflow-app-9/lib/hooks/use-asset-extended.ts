'use client'

/**
 * Extended Asset Hooks - Covers all Asset-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAssets(userId?: string, assetType?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('assets').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (assetType) query = query.eq('asset_type', assetType)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, assetType, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAssetLibrary(libraryId?: string, assetType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!libraryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('asset_library').select('*').eq('library_id', libraryId).order('name', { ascending: true })
      if (assetType) query = query.eq('asset_type', assetType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [libraryId, assetType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAssetVersions(assetId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!assetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('asset_versions').select('*').eq('asset_id', assetId).order('version_number', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [assetId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
