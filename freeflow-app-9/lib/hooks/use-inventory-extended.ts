'use client'

/**
 * Extended Inventory Hooks
 * Tables: inventory, inventory_items, inventory_movements, inventory_locations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInventoryItem(itemId?: string) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('inventory_items').select('*').eq('id', itemId).single(); setItem(data) } finally { setIsLoading(false) }
  }, [itemId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { item, isLoading, refresh: fetch }
}

export function useInventoryItems(options?: { location_id?: string; category?: string; status?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('inventory_items').select('*')
      if (options?.location_id) query = query.eq('location_id', options.location_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [options?.location_id, options?.category, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useInventoryMovements(itemId?: string, options?: { type?: string; limit?: number }) {
  const [movements, setMovements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('inventory_movements').select('*').eq('item_id', itemId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMovements(data || [])
    } finally { setIsLoading(false) }
  }, [itemId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { movements, isLoading, refresh: fetch }
}

export function useInventoryLocations() {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('inventory_locations').select('*').order('name', { ascending: true }); setLocations(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { locations, isLoading, refresh: fetch }
}

export function useLowStockItems(options?: { limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('inventory_items').select('*').filter('quantity', 'lte', 'reorder_point').order('quantity', { ascending: true }).limit(options?.limit || 50); setItems(data || []) } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useInventoryByCategory(category?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!category) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('inventory_items').select('*').eq('category', category).order('name', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [category, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}
