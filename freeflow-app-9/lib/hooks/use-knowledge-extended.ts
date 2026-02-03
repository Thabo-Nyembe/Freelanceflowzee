'use client'

/**
 * Extended Knowledge Hooks - Covers all Knowledge-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useKnowledgeBases(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('knowledge_bases').select('*').eq('owner_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useKnowledgeEntries(baseId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!baseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('knowledge_entries').select('*').eq('base_id', baseId).order('title', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [baseId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
