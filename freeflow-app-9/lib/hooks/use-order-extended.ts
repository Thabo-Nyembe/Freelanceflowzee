'use client'

/**
 * Extended Order Hooks - Covers all Order-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// Order type for this hook
export interface OrderRecord {
  id: string
  user_id: string
  order_number?: string
  customer_name?: string | null
  customer_email?: string | null
  status?: string
  total_amount?: number
  created_at: string
  updated_at?: string
  [key: string]: JsonValue | undefined
}

// Order item type for this hook
export interface OrderItemRecord {
  id: string
  order_id: string
  product_name?: string
  quantity?: number
  unit_price?: number
  total_price?: number
  created_at: string
  [key: string]: JsonValue | undefined
}

export function useOrders(userId?: string) {
  const [data, setData] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData((result as OrderRecord[]) || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useOrderItems(orderId?: string) {
  const [data, setData] = useState<OrderItemRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('order_items').select('*').eq('order_id', orderId); setData((result as OrderItemRecord[]) || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
