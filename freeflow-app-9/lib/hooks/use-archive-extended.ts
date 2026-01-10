'use client'

/**
 * Extended Archive Hooks - Covers all Archive-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useArchives(userId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('archives').select('*').order('archived_at', { ascending: false }).limit(50)
      if (userId) query = query.eq('archived_by', userId)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useArchiveById(archiveId?: string) {
  const [archive, setArchive] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!archiveId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('archives').select('*').eq('id', archiveId).single()
      setArchive(data)
    } finally { setIsLoading(false) }
  }, [archiveId])
  useEffect(() => { fetch() }, [fetch])
  return { archive, isLoading, refresh: fetch }
}

export function useArchiveStats(entityType?: string) {
  const [stats, setStats] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('archives').select('entity_type, status')
      if (entityType) query = query.eq('entity_type', entityType)
      const { data } = await query
      const result: Record<string, { total: number; restored: number; pending: number }> = {}
      data?.forEach(a => {
        if (!result[a.entity_type]) result[a.entity_type] = { total: 0, restored: 0, pending: 0 }
        result[a.entity_type].total++
        if (a.status === 'restored') result[a.entity_type].restored++
        else result[a.entity_type].pending++
      })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
