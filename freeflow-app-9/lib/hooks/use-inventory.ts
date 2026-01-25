'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued' | 'on-order' | 'backorder'

export interface InventoryItem {
  id: string
  user_id: string

  // Basic Info
  product_name: string
  sku: string | null
  barcode: string | null

  // Classification
  category: string | null
  subcategory: string | null
  brand: string | null
  manufacturer: string | null

  // Stock Levels
  quantity: number
  reserved_quantity: number
  available_quantity: number
  reorder_point: number
  reorder_quantity: number
  minimum_stock_level: number
  maximum_stock_level: number

  // Status
  status: InventoryStatus
  is_active: boolean

  // Pricing
  unit_price: number
  cost_price: number
  selling_price: number
  total_value: number
  currency: string

  // Supplier Information
  supplier_name: string | null
  supplier_id: string | null
  supplier_sku: string | null
  lead_time_days: number

  // Location
  warehouse: string | null
  warehouse_location: string | null
  aisle: string | null
  shelf: string | null
  bin: string | null

  // Physical Properties
  weight_kg: number
  dimensions_cm: string | null
  volume_m3: number

  // Tracking
  last_restocked_at: string | null
  last_sold_at: string | null
  last_counted_at: string | null
  days_in_stock: number

  // Performance Metrics
  turnover_rate: number
  sell_through_rate: number
  stock_cover_days: number
  total_sales: number
  total_revenue: number

  // Alerts
  low_stock_alert: boolean
  out_of_stock_alert: boolean
  expiry_alert: boolean

  // Expiration
  has_expiry: boolean
  expiry_date: string | null
  days_until_expiry: number | null
  batch_number: string | null
  lot_number: string | null

  // Tax & Compliance
  tax_rate: number
  is_taxable: boolean
  customs_code: string | null
  origin_country: string | null

  // Metadata
  description: string | null
  notes: string | null
  tags: string[] | null
  image_url: string | null
  images: string[] | null

  // Timestamps
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UseInventoryOptions {
  status?: InventoryStatus | 'all'
  category?: string | 'all'
  warehouse?: string | 'all'
  lowStock?: boolean
  expiring?: boolean
}

export function useInventory(options: UseInventoryOptions = {}) {
  const { status, category, warehouse, lowStock, expiring } = options
  const [data, setData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('inventory')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (warehouse && warehouse !== 'all') {
        query = query.eq('warehouse', warehouse)
      }

      if (lowStock) {
        query = query.eq('low_stock_alert', true)
      }

      if (expiring) {
        query = query.eq('expiry_alert', true)
      }

      const { data: result, error: queryError } = await query

      if (queryError) throw queryError
      setData((result as InventoryItem[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [status, category, warehouse, lowStock, expiring])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useCreateInventoryItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (itemData: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error: insertError } = await supabase
        .from('inventory')
        .insert({ ...itemData, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      return result as InventoryItem
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}

export function useUpdateInventoryItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (itemData: Partial<InventoryItem> & { id: string }): Promise<InventoryItem | null> => {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { id, ...updateData } = itemData
      const { data: result, error: updateError } = await supabase
        .from('inventory')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      return result as InventoryItem
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}

export function useDeleteInventoryItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (id: string): Promise<boolean> => {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete
      const { error: deleteError } = await supabase
        .from('inventory')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}
