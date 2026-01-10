'use client'

/**
 * Extended Warehouses Hooks
 * Tables: warehouses, warehouse_locations, warehouse_inventory, warehouse_transfers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWarehouse(warehouseId?: string) {
  const [warehouse, setWarehouse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('warehouses').select('*, warehouse_locations(*)').eq('id', warehouseId).single(); setWarehouse(data) } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { fetch() }, [fetch])
  return { warehouse, isLoading, refresh: fetch }
}

export function useWarehouses(options?: { status?: string; city?: string; country?: string; limit?: number }) {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('warehouses').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.city) query = query.eq('city', options.city)
      if (options?.country) query = query.eq('country', options.country)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setWarehouses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.city, options?.country, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { warehouses, isLoading, refresh: fetch }
}

export function useWarehouseLocations(warehouseId?: string) {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('warehouse_locations').select('*').eq('warehouse_id', warehouseId).order('code', { ascending: true }); setLocations(data || []) } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { fetch() }, [fetch])
  return { locations, isLoading, refresh: fetch }
}

export function useWarehouseInventory(warehouseId?: string, options?: { product_id?: string; low_stock?: boolean }) {
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('warehouse_inventory').select('*').eq('warehouse_id', warehouseId); if (options?.product_id) query = query.eq('product_id', options.product_id); if (options?.low_stock) query = query.lt('quantity', 10); const { data } = await query.order('product_id', { ascending: true }); setInventory(data || []) } finally { setIsLoading(false) }
  }, [warehouseId, options?.product_id, options?.low_stock])
  useEffect(() => { fetch() }, [fetch])
  return { inventory, isLoading, refresh: fetch }
}

export function useWarehouseTransfers(options?: { from_warehouse_id?: string; to_warehouse_id?: string; status?: string; limit?: number }) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('warehouse_transfers').select('*')
      if (options?.from_warehouse_id) query = query.eq('from_warehouse_id', options.from_warehouse_id)
      if (options?.to_warehouse_id) query = query.eq('to_warehouse_id', options.to_warehouse_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTransfers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.from_warehouse_id, options?.to_warehouse_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transfers, isLoading, refresh: fetch }
}
