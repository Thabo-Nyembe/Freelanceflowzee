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
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('warehouses').select('*, warehouse_locations(*)').eq('id', warehouseId).single(); setWarehouse(data) } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { loadData() }, [loadData])
  return { warehouse, isLoading, refresh: loadData }
}

export function useWarehouses(options?: { status?: string; city?: string; country?: string; limit?: number }) {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { warehouses, isLoading, refresh: loadData }
}

export function useWarehouseLocations(warehouseId?: string) {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('warehouse_locations').select('*').eq('warehouse_id', warehouseId).order('code', { ascending: true }); setLocations(data || []) } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { loadData() }, [loadData])
  return { locations, isLoading, refresh: loadData }
}

export function useWarehouseInventory(warehouseId?: string, options?: { product_id?: string; low_stock?: boolean }) {
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('warehouse_inventory').select('*').eq('warehouse_id', warehouseId); if (options?.product_id) query = query.eq('product_id', options.product_id); if (options?.low_stock) query = query.lt('quantity', 10); const { data } = await query.order('product_id', { ascending: true }); setInventory(data || []) } finally { setIsLoading(false) }
  }, [warehouseId, options?.product_id, options?.low_stock])
  useEffect(() => { loadData() }, [loadData])
  return { inventory, isLoading, refresh: loadData }
}

export function useWarehouseTransfers(options?: { from_warehouse_id?: string; to_warehouse_id?: string; status?: string; limit?: number }) {
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { transfers, isLoading, refresh: loadData }
}

// ==========================================
// Warehouse Location Mutations
// ==========================================

export interface WarehouseLocation {
  id: string
  warehouse_id: string
  code: string
  name: string
  type: 'zone' | 'aisle' | 'rack' | 'bin'
  parent_id?: string | null
  capacity_units: number
  used_units: number
  temperature_min?: number | null
  temperature_max?: number | null
  humidity_max?: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateLocationInput {
  warehouse_id: string
  code: string
  name: string
  type: 'zone' | 'aisle' | 'rack' | 'bin'
  parent_id?: string | null
  capacity_units?: number
  temperature_min?: number | null
  temperature_max?: number | null
  humidity_max?: number | null
}

export interface UpdateLocationInput {
  code?: string
  name?: string
  type?: 'zone' | 'aisle' | 'rack' | 'bin'
  capacity_units?: number
  temperature_min?: number | null
  temperature_max?: number | null
  humidity_max?: number | null
  is_active?: boolean
}

export function useWarehouseLocationMutations(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createLocation = useCallback(async (input: CreateLocationInput): Promise<WarehouseLocation | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_locations')
        .insert({
          ...input,
          capacity_units: input.capacity_units || 0,
          used_units: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as WarehouseLocation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create location')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const updateLocation = useCallback(async (id: string, input: UpdateLocationInput): Promise<WarehouseLocation | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_locations')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as WarehouseLocation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update location')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const deleteLocation = useCallback(async (id: string, hardDelete = false): Promise<void> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      if (hardDelete) {
        const { error: dbError } = await supabase
          .from('warehouse_locations')
          .delete()
          .eq('id', id)
        if (dbError) throw new Error(dbError.message)
      } else {
        const { error: dbError } = await supabase
          .from('warehouse_locations')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id)
        if (dbError) throw new Error(dbError.message)
      }
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete location')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  return {
    createLocation,
    updateLocation,
    deleteLocation,
    isLoading,
    error
  }
}

// ==========================================
// Warehouse Zone Mutations
// ==========================================

export interface WarehouseZone {
  id: string
  warehouse_id: string
  code: string
  name: string
  zone_type: string
  capacity_sqm: number
  utilization_percent: number
  product_count: number
  temperature_min?: number | null
  temperature_max?: number | null
  humidity_max?: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateZoneInput {
  warehouse_id: string
  code: string
  name: string
  zone_type: string
  capacity_sqm?: number
  temperature_min?: number | null
  temperature_max?: number | null
  humidity_max?: number | null
}

export interface UpdateZoneInput {
  code?: string
  name?: string
  zone_type?: string
  capacity_sqm?: number
  temperature_min?: number | null
  temperature_max?: number | null
  humidity_max?: number | null
  is_active?: boolean
}

export function useWarehouseZoneMutations(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createZone = useCallback(async (input: CreateZoneInput): Promise<WarehouseZone | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_zones')
        .insert({
          ...input,
          capacity_sqm: input.capacity_sqm || 0,
          utilization_percent: 0,
          product_count: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as WarehouseZone
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create zone')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const updateZone = useCallback(async (id: string, input: UpdateZoneInput): Promise<WarehouseZone | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_zones')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as WarehouseZone
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update zone')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const deleteZone = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { error: dbError } = await supabase
        .from('warehouse_zones')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete zone')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  return {
    createZone,
    updateZone,
    deleteZone,
    isLoading,
    error
  }
}

// ==========================================
// Warehouse Aisle Mutations
// ==========================================

export interface WarehouseAisle {
  id: string
  zone_id: string
  code: string
  name: string
  rack_count: number
  capacity_units: number
  used_units: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateAisleInput {
  zone_id: string
  code: string
  name: string
  rack_count?: number
  capacity_units?: number
}

export interface UpdateAisleInput {
  code?: string
  name?: string
  rack_count?: number
  capacity_units?: number
  is_active?: boolean
}

export function useWarehouseAisleMutations(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createAisle = useCallback(async (input: CreateAisleInput): Promise<WarehouseAisle | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_aisles')
        .insert({
          ...input,
          rack_count: input.rack_count || 0,
          capacity_units: input.capacity_units || 0,
          used_units: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as WarehouseAisle
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create aisle')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const updateAisle = useCallback(async (id: string, input: UpdateAisleInput): Promise<WarehouseAisle | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_aisles')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as WarehouseAisle
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update aisle')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const deleteAisle = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { error: dbError } = await supabase
        .from('warehouse_aisles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete aisle')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  return {
    createAisle,
    updateAisle,
    deleteAisle,
    isLoading,
    error
  }
}

// ==========================================
// Bin Assignment Mutations
// ==========================================

export interface BinAssignment {
  id: string
  bin_id: string
  product_id: string
  quantity: number
  assigned_at: string
  assigned_by: string
}

export interface AssignBinInput {
  bin_id: string
  product_id: string
  quantity: number
  assigned_by?: string
}

export function useBinAssignmentMutations(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const assignBin = useCallback(async (input: AssignBinInput): Promise<BinAssignment | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      // Check if bin already has an assignment for this product
      const { data: existing } = await supabase
        .from('warehouse_bin_assignments')
        .select('*')
        .eq('bin_id', input.bin_id)
        .eq('product_id', input.product_id)
        .single()

      let result
      if (existing) {
        // Update existing assignment
        const { data, error: dbError } = await supabase
          .from('warehouse_bin_assignments')
          .update({
            quantity: existing.quantity + input.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()
        if (dbError) throw new Error(dbError.message)
        result = data
      } else {
        // Create new assignment
        const { data, error: dbError } = await supabase
          .from('warehouse_bin_assignments')
          .insert({
            ...input,
            assigned_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        if (dbError) throw new Error(dbError.message)
        result = data
      }

      // Update bin used capacity
      await supabase.rpc('update_bin_capacity', { bin_id: input.bin_id })

      onSuccess?.()
      return result as BinAssignment
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to assign bin')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const unassignBin = useCallback(async (binId: string, productId: string): Promise<void> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { error: dbError } = await supabase
        .from('warehouse_bin_assignments')
        .delete()
        .eq('bin_id', binId)
        .eq('product_id', productId)

      if (dbError) throw new Error(dbError.message)

      // Update bin used capacity
      await supabase.rpc('update_bin_capacity', { bin_id: binId })

      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unassign bin')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  return {
    assignBin,
    unassignBin,
    isLoading,
    error
  }
}

// ==========================================
// Inventory Movement Mutations
// ==========================================

export interface InventoryMovement {
  id: string
  product_id: string
  from_location_id: string
  to_location_id: string
  quantity: number
  reason: string
  moved_by: string
  moved_at: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export interface MoveInventoryInput {
  product_id: string
  from_location_id: string
  to_location_id: string
  quantity: number
  reason?: string
  moved_by?: string
}

export function useInventoryMovementMutations(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const moveInventory = useCallback(async (input: MoveInventoryInput): Promise<InventoryMovement | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      // Verify source has enough quantity
      const { data: sourceInventory } = await supabase
        .from('warehouse_inventory')
        .select('quantity')
        .eq('location_id', input.from_location_id)
        .eq('product_id', input.product_id)
        .single()

      if (!sourceInventory || sourceInventory.quantity < input.quantity) {
        throw new Error('Insufficient inventory at source location')
      }

      // Create movement record
      const { data: movement, error: movementError } = await supabase
        .from('warehouse_inventory_movements')
        .insert({
          ...input,
          reason: input.reason || 'Manual transfer',
          status: 'completed',
          moved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (movementError) throw new Error(movementError.message)

      // Update source inventory (reduce quantity)
      const { error: sourceError } = await supabase
        .from('warehouse_inventory')
        .update({
          quantity: sourceInventory.quantity - input.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('location_id', input.from_location_id)
        .eq('product_id', input.product_id)

      if (sourceError) throw new Error(sourceError.message)

      // Update or create destination inventory
      const { data: destInventory } = await supabase
        .from('warehouse_inventory')
        .select('id, quantity')
        .eq('location_id', input.to_location_id)
        .eq('product_id', input.product_id)
        .single()

      if (destInventory) {
        // Update existing
        const { error: destError } = await supabase
          .from('warehouse_inventory')
          .update({
            quantity: destInventory.quantity + input.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', destInventory.id)
        if (destError) throw new Error(destError.message)
      } else {
        // Create new
        const { error: createError } = await supabase
          .from('warehouse_inventory')
          .insert({
            location_id: input.to_location_id,
            product_id: input.product_id,
            quantity: input.quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        if (createError) throw new Error(createError.message)
      }

      onSuccess?.()
      return movement as InventoryMovement
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to move inventory')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  return {
    moveInventory,
    isLoading,
    error
  }
}

// ==========================================
// Cycle Count Mutations
// ==========================================

export interface CycleCountRecord {
  id: string
  warehouse_id: string
  zone_id?: string
  count_number: string
  status: 'scheduled' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled'
  scheduled_date: string
  started_at?: string
  completed_at?: string
  assigned_to?: string
  total_items: number
  counted_items: number
  variance_count: number
  variance_value: number
  accuracy_percent: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateCycleCountInput {
  warehouse_id: string
  zone_id?: string
  scheduled_date: string
  assigned_to?: string
  notes?: string
}

export interface UpdateCycleCountInput {
  status?: 'scheduled' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled'
  started_at?: string
  completed_at?: string
  assigned_to?: string
  counted_items?: number
  variance_count?: number
  variance_value?: number
  accuracy_percent?: number
  notes?: string
}

export interface CycleCountItemInput {
  cycle_count_id: string
  product_id: string
  location_id: string
  expected_quantity: number
  counted_quantity: number
  variance: number
  counted_by?: string
}

export function useCycleCountMutations(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCycleCount = useCallback(async (input: CreateCycleCountInput): Promise<CycleCountRecord | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      // Generate count number
      const countNumber = `CC-${Date.now().toString(36).toUpperCase()}`

      const { data, error: dbError } = await supabase
        .from('warehouse_cycle_counts')
        .insert({
          ...input,
          count_number: countNumber,
          status: 'scheduled',
          total_items: 0,
          counted_items: 0,
          variance_count: 0,
          variance_value: 0,
          accuracy_percent: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as CycleCountRecord
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create cycle count')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const updateCycleCount = useCallback(async (id: string, input: UpdateCycleCountInput): Promise<CycleCountRecord | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('warehouse_cycle_counts')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (dbError) throw new Error(dbError.message)
      onSuccess?.()
      return data as CycleCountRecord
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update cycle count')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  const startCycleCount = useCallback(async (id: string): Promise<CycleCountRecord | null> => {
    return updateCycleCount(id, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
  }, [updateCycleCount])

  const completeCycleCount = useCallback(async (id: string): Promise<CycleCountRecord | null> => {
    return updateCycleCount(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }, [updateCycleCount])

  const recordCountItem = useCallback(async (input: CycleCountItemInput): Promise<void> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      // Record the count item
      const { error: itemError } = await supabase
        .from('warehouse_cycle_count_items')
        .insert({
          ...input,
          counted_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })

      if (itemError) throw new Error(itemError.message)

      // Update cycle count totals
      const { data: items } = await supabase
        .from('warehouse_cycle_count_items')
        .select('expected_quantity, counted_quantity, variance')
        .eq('cycle_count_id', input.cycle_count_id)

      if (items) {
        const totalItems = items.length
        const varianceCount = items.filter(i => i.variance !== 0).length
        const varianceValue = items.reduce((sum, i) => sum + Math.abs(i.variance), 0)
        const totalExpected = items.reduce((sum, i) => sum + i.expected_quantity, 0)
        const totalCounted = items.reduce((sum, i) => sum + i.counted_quantity, 0)
        const accuracy = totalExpected > 0
          ? ((totalExpected - Math.abs(totalExpected - totalCounted)) / totalExpected) * 100
          : 100

        await supabase
          .from('warehouse_cycle_counts')
          .update({
            counted_items: totalItems,
            variance_count: varianceCount,
            variance_value: varianceValue,
            accuracy_percent: Math.round(accuracy * 100) / 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', input.cycle_count_id)
      }

      // If variance exists, update the actual inventory
      if (input.variance !== 0) {
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: input.counted_quantity,
            last_counted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('location_id', input.location_id)
          .eq('product_id', input.product_id)
      }

      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to record count item')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess])

  return {
    createCycleCount,
    updateCycleCount,
    startCycleCount,
    completeCycleCount,
    recordCountItem,
    isLoading,
    error
  }
}
