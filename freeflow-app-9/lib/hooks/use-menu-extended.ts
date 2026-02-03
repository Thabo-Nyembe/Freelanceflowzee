'use client'

/**
 * Extended Menu Hooks - Covers all Menu-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMenus(menuType?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('menus').select('*').order('name', { ascending: true })
      if (menuType) query = query.eq('menu_type', menuType)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [menuType, isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMenuItems(menuId?: string, parentId?: string | null) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('menu_items').select('*').order('sort_order', { ascending: true })
      if (menuId) query = query.eq('menu_id', menuId)
      if (parentId === null) query = query.is('parent_id', null)
      else if (parentId) query = query.eq('parent_id', parentId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [menuId, parentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMenuTree(menuId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!menuId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: items } = await supabase.from('menu_items').select('*').eq('menu_id', menuId).eq('is_visible', true).order('sort_order', { ascending: true })
      const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return (items || []).filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) }))
      }
      setData(buildTree(items || []))
    } finally { setIsLoading(false) }
  }, [menuId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
