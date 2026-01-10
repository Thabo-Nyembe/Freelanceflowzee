'use client'

/**
 * Extended Navigation Hooks - Covers all Navigation-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNavigations(navigationType?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('navigations').select('*').order('name', { ascending: true })
      if (navigationType) query = query.eq('navigation_type', navigationType)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [navigationType, isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNavigationItems(navigationId?: string, parentId?: string | null) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('navigation_items').select('*').order('sort_order', { ascending: true })
      if (navigationId) query = query.eq('navigation_id', navigationId)
      if (parentId === null) query = query.is('parent_id', null)
      else if (parentId) query = query.eq('parent_id', parentId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [navigationId, parentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNavigationTree(navigationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!navigationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: items } = await supabase.from('navigation_items').select('*').eq('navigation_id', navigationId).eq('is_visible', true).order('sort_order', { ascending: true })
      const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return (items || []).filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) }))
      }
      setData(buildTree(items || []))
    } finally { setIsLoading(false) }
  }, [navigationId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
