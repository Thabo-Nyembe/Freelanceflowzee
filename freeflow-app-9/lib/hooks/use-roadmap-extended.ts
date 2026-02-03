'use client'

/**
 * Extended Roadmap Hooks - Covers all Roadmap-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRoadmaps(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('roadmaps').select('*').order('created_at', { ascending: false })
      if (projectId) query = query.eq('project_id', projectId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useRoadmapItems(roadmapId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!roadmapId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('roadmap_items').select('*').eq('roadmap_id', roadmapId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [roadmapId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
