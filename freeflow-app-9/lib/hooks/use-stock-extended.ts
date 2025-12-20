'use client'

/**
 * Extended Stock Hooks - Covers all Stock-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStockItems(warehouseId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('stock_items').select('*').order('name', { ascending: true })
      if (warehouseId) query = query.eq('warehouse_id', warehouseId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [warehouseId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useStockMovements(itemId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('stock_movements').select('*').eq('item_id', itemId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [itemId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
