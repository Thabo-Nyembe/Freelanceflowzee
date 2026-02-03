'use client'

/**
 * Extended Config Hooks - Covers all Config-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConfigs(category?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('configs').select('*').order('key', { ascending: true })
      if (category) query = query.eq('category', category)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [category])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useConfigVersions(configId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!configId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('config_versions').select('*').eq('config_id', configId).order('version', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [configId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
