'use client'

/**
 * Extended Warehouse Hooks - Covers all Warehouse-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWarehouses(organizationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('warehouses').select('*').order('name', { ascending: true })
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWarehouseZones(warehouseId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('warehouse_zones').select('*').eq('warehouse_id', warehouseId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
