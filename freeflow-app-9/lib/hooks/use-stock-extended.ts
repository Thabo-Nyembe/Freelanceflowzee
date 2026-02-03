'use client'

/**
 * Extended Stock Hooks - Covers all Stock-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStockItems(warehouseId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stock_items').select('*').order('name', { ascending: true })
      if (warehouseId) query = query.eq('warehouse_id', warehouseId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useStockMovements(itemId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('stock_movements').select('*').eq('item_id', itemId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
