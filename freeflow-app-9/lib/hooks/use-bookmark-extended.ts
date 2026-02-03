'use client'

/**
 * Extended Bookmark Hooks - Covers all Bookmark-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBookmarks(userId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('bookmarks').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, itemType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useBookmarkFolders(userId?: string, parentId?: string | null) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('bookmark_folders').select('*').order('name', { ascending: true })
      if (userId) query = query.eq('user_id', userId)
      if (parentId === null) query = query.is('parent_id', null)
      else if (parentId) query = query.eq('parent_id', parentId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, parentId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useIsBookmarked(userId?: string, itemId?: string, itemType?: string) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single()
      setIsBookmarked(!!data)
    } finally { setIsLoading(false) }
  }, [userId, itemId, itemType])
  useEffect(() => { check() }, [check])
  return { isBookmarked, isLoading, refresh: check }
}
