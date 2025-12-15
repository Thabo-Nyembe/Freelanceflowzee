'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useMemo } from 'react'

export interface StockMovement {
  id: string
  user_id: string
  movement_number: string
  movement_type: string
  product_name: string
  sku: string | null
  quantity: number
  unit_price: number
  total_value: number
  from_location: string | null
  to_location: string | null
  from_warehouse_id: string | null
  to_warehouse_id: string | null
  reference_number: string | null
  reference_type: string | null
  status: string
  operator_name: string | null
  operator_id: string | null
  notes: string | null
  batch_number: string | null
  expiry_date: string | null
  metadata: Record<string, unknown>
  movement_date: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface StockLevel {
  id: string
  user_id: string
  warehouse_id: string | null
  zone_id: string | null
  product_name: string
  sku: string | null
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  reorder_point: number
  reorder_quantity: number
  unit_cost: number
  total_value: number
  last_movement_date: string | null
  last_count_date: string | null
  location_code: string | null
  batch_number: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
}

export interface StockMovementFilters {
  movementType?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function useStockMovements(initialData?: StockMovement[], filters?: StockMovementFilters) {
  const query = useSupabaseQuery<StockMovement>({
    table: 'stock_movements',
    select: '*',
    orderBy: { column: 'movement_date', ascending: false },
    initialData
  })

  const filteredMovements = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(movement => {
      if (filters?.movementType && filters.movementType !== 'all' && movement.movement_type !== filters.movementType) return false
      if (filters?.status && filters.status !== 'all' && movement.status !== filters.status) return false
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        const movementDate = new Date(movement.movement_date)
        if (movementDate < fromDate) return false
      }
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo)
        const movementDate = new Date(movement.movement_date)
        if (movementDate > toDate) return false
      }
      return true
    })
  }, [query.data, filters])

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      inbound: 0,
      outbound: 0,
      transfer: 0,
      adjustment: 0,
      pending: 0,
      completed: 0,
      totalInboundValue: 0,
      totalOutboundValue: 0,
      netValue: 0
    }

    const inbound = query.data.filter(m => m.movement_type === 'inbound')
    const outbound = query.data.filter(m => m.movement_type === 'outbound')
    const transfer = query.data.filter(m => m.movement_type === 'transfer').length
    const adjustment = query.data.filter(m => m.movement_type === 'adjustment').length
    const pending = query.data.filter(m => m.status === 'pending' || m.status === 'in-transit').length
    const completed = query.data.filter(m => m.status === 'completed').length

    const totalInboundValue = inbound.reduce((sum, m) => sum + Math.abs(Number(m.total_value)), 0)
    const totalOutboundValue = outbound.reduce((sum, m) => sum + Math.abs(Number(m.total_value)), 0)
    const netValue = totalInboundValue - totalOutboundValue

    return {
      total: query.data.length,
      inbound: inbound.length,
      outbound: outbound.length,
      transfer,
      adjustment,
      pending,
      completed,
      totalInboundValue,
      totalOutboundValue,
      netValue
    }
  }, [query.data])

  return {
    ...query,
    movements: filteredMovements,
    stats
  }
}

export function useStockLevels(warehouseId?: string, initialData?: StockLevel[]) {
  const filters = warehouseId
    ? [{ column: 'warehouse_id', operator: 'eq' as const, value: warehouseId }]
    : []

  const query = useSupabaseQuery<StockLevel>({
    table: 'stock_levels',
    select: '*',
    filters,
    orderBy: { column: 'product_name', ascending: true },
    initialData
  })

  const lowStockItems = useMemo(() => {
    if (!query.data) return []
    return query.data.filter(item => item.quantity_available <= item.reorder_point)
  }, [query.data])

  const stats = useMemo(() => {
    if (!query.data) return {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    }

    const totalValue = query.data.reduce((sum, item) => sum + Number(item.total_value), 0)
    const lowStockCount = query.data.filter(item =>
      item.quantity_available <= item.reorder_point && item.quantity_available > 0
    ).length
    const outOfStockCount = query.data.filter(item => item.quantity_available <= 0).length

    return {
      totalProducts: query.data.length,
      totalValue,
      lowStockCount,
      outOfStockCount
    }
  }, [query.data])

  return {
    ...query,
    stockLevels: query.data || [],
    lowStockItems,
    stats
  }
}

export function useStockMovementMutations() {
  const createMovement = useSupabaseMutation<StockMovement>({
    table: 'stock_movements',
    operation: 'insert',
    invalidateQueries: ['stock_movements', 'stock_levels']
  })

  const updateMovement = useSupabaseMutation<StockMovement>({
    table: 'stock_movements',
    operation: 'update',
    invalidateQueries: ['stock_movements', 'stock_levels']
  })

  const completeMovement = useSupabaseMutation<StockMovement>({
    table: 'stock_movements',
    operation: 'update',
    invalidateQueries: ['stock_movements', 'stock_levels']
  })

  return {
    createMovement: createMovement.mutate,
    updateMovement: updateMovement.mutate,
    completeMovement: (id: string) => completeMovement.mutate({
      id,
      status: 'completed',
      completed_at: new Date().toISOString()
    }),
    isCreating: createMovement.isLoading,
    isUpdating: updateMovement.isLoading,
    isCompleting: completeMovement.isLoading
  }
}

export function useStockLevelMutations() {
  const updateStockLevel = useSupabaseMutation<StockLevel>({
    table: 'stock_levels',
    operation: 'update',
    invalidateQueries: ['stock_levels']
  })

  const createStockLevel = useSupabaseMutation<StockLevel>({
    table: 'stock_levels',
    operation: 'insert',
    invalidateQueries: ['stock_levels']
  })

  return {
    createStockLevel: createStockLevel.mutate,
    updateStockLevel: updateStockLevel.mutate,
    isCreating: createStockLevel.isLoading,
    isUpdating: updateStockLevel.isLoading
  }
}
