'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useMemo } from 'react'

export interface Warehouse {
  id: string
  user_id: string
  warehouse_code: string
  warehouse_name: string
  warehouse_type: string
  status: string
  location: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  capacity_sqm: number
  utilization_percent: number
  staff_count: number
  product_count: number
  zone_count: number
  manager_name: string | null
  manager_email: string | null
  phone: string | null
  operating_hours: string | null
  last_inspection_date: string | null
  latitude: number | null
  longitude: number | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WarehouseZone {
  id: string
  warehouse_id: string
  user_id: string
  zone_code: string
  zone_name: string
  zone_type: string
  capacity_sqm: number
  utilization_percent: number
  product_count: number
  temperature_min: number | null
  temperature_max: number | null
  humidity_max: number | null
  created_at: string
  updated_at: string
}

export interface WarehouseFilters {
  status?: string
  warehouseType?: string
  location?: string
}

export function useWarehouses(initialData?: Warehouse[], filters?: WarehouseFilters) {
  const query = useSupabaseQuery<Warehouse>({
    table: 'warehouses',
    select: '*',
    filters: [
      { column: 'deleted_at', operator: 'is', value: null }
    ],
    orderBy: { column: 'warehouse_name', ascending: true },
    initialData
  })

  const filteredWarehouses = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(warehouse => {
      if (filters?.status && filters.status !== 'all' && warehouse.status !== filters.status) return false
      if (filters?.warehouseType && filters.warehouseType !== 'all' && warehouse.warehouse_type !== filters.warehouseType) return false
      if (filters?.location && filters.location !== 'all' && warehouse.location !== filters.location) return false
      return true
    })
  }, [query.data, filters])

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      active: 0,
      maintenance: 0,
      inactive: 0,
      totalCapacity: 0,
      avgUtilization: 0,
      totalStaff: 0,
      totalProducts: 0
    }

    const active = query.data.filter(w => w.status === 'active').length
    const maintenance = query.data.filter(w => w.status === 'maintenance').length
    const inactive = query.data.filter(w => w.status === 'inactive').length
    const totalCapacity = query.data.reduce((sum, w) => sum + Number(w.capacity_sqm), 0)
    const avgUtilization = query.data.length > 0
      ? query.data.reduce((sum, w) => sum + Number(w.utilization_percent), 0) / query.data.length
      : 0
    const totalStaff = query.data.reduce((sum, w) => sum + w.staff_count, 0)
    const totalProducts = query.data.reduce((sum, w) => sum + w.product_count, 0)

    return {
      total: query.data.length,
      active,
      maintenance,
      inactive,
      totalCapacity,
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      totalStaff,
      totalProducts
    }
  }, [query.data])

  return {
    ...query,
    warehouses: filteredWarehouses,
    stats
  }
}

export function useWarehouseZones(warehouseId?: string) {
  return useSupabaseQuery<WarehouseZone>({
    table: 'warehouse_zones',
    select: '*',
    filters: warehouseId ? [{ column: 'warehouse_id', operator: 'eq', value: warehouseId }] : [],
    orderBy: { column: 'zone_code', ascending: true },
    enabled: !!warehouseId
  })
}

export function useWarehouseMutations() {
  const createWarehouse = useSupabaseMutation<Warehouse>({
    table: 'warehouses',
    operation: 'insert',
    invalidateQueries: ['warehouses']
  })

  const updateWarehouse = useSupabaseMutation<Warehouse>({
    table: 'warehouses',
    operation: 'update',
    invalidateQueries: ['warehouses']
  })

  const deleteWarehouse = useSupabaseMutation<Warehouse>({
    table: 'warehouses',
    operation: 'update',
    invalidateQueries: ['warehouses']
  })

  return {
    createWarehouse: createWarehouse.mutate,
    updateWarehouse: updateWarehouse.mutate,
    deleteWarehouse: (id: string) => deleteWarehouse.mutate({ id, deleted_at: new Date().toISOString() }),
    isCreating: createWarehouse.isLoading,
    isUpdating: updateWarehouse.isLoading,
    isDeleting: deleteWarehouse.isLoading
  }
}

export function useWarehouseZoneMutations() {
  const createZone = useSupabaseMutation<WarehouseZone>({
    table: 'warehouse_zones',
    operation: 'insert',
    invalidateQueries: ['warehouse_zones']
  })

  const updateZone = useSupabaseMutation<WarehouseZone>({
    table: 'warehouse_zones',
    operation: 'update',
    invalidateQueries: ['warehouse_zones']
  })

  return {
    createZone: createZone.mutate,
    updateZone: updateZone.mutate,
    isCreating: createZone.isLoading,
    isUpdating: updateZone.isLoading
  }
}
