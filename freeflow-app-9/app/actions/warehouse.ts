'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('warehouse-actions')

export interface CreateWarehouseInput {
  warehouse_name: string
  warehouse_type?: string
  location?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  capacity_sqm?: number
  manager_name?: string
  manager_email?: string
  phone?: string
  operating_hours?: string
  latitude?: number
  longitude?: number
  configuration?: Record<string, unknown>
}

export interface UpdateWarehouseInput extends Partial<CreateWarehouseInput> {
  id: string
  status?: string
  utilization_percent?: number
  staff_count?: number
  product_count?: number
  zone_count?: number
  last_inspection_date?: string
}

export async function createWarehouse(input: CreateWarehouseInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Generate warehouse code
    const { data: lastWarehouse } = await supabase
      .from('warehouses')
      .select('warehouse_code')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNumber = lastWarehouse?.warehouse_code
      ? parseInt(lastWarehouse.warehouse_code.replace('WH-', ''))
      : 0
    const warehouseCode = `WH-${(lastNumber + 1).toString().padStart(3, '0')}`

    const { data, error } = await supabase
      .from('warehouses')
      .insert({
        ...input,
        user_id: user.id,
        warehouse_code: warehouseCode
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create warehouse', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/warehouse-v2')
    logger.info('Warehouse created', { userId: user.id, warehouseId: data.id })
    return actionSuccess(data, 'Warehouse created successfully')
  } catch (error) {
    logger.error('Unexpected error in createWarehouse', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateWarehouse(input: UpdateWarehouseInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('warehouses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update warehouse', { error, userId: user.id, warehouseId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/warehouse-v2')
    logger.info('Warehouse updated', { userId: user.id, warehouseId: id })
    return actionSuccess(data, 'Warehouse updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateWarehouse', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteWarehouse(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('warehouses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete warehouse', { error, userId: user.id, warehouseId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/warehouse-v2')
    logger.info('Warehouse deleted', { userId: user.id, warehouseId: id })
    return actionSuccess({ id }, 'Warehouse deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteWarehouse', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createWarehouseZone(input: {
  warehouse_id: string
  zone_name: string
  zone_type?: string
  capacity_sqm?: number
  temperature_min?: number
  temperature_max?: number
  humidity_max?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Generate zone code
    const { data: lastZone } = await supabase
      .from('warehouse_zones')
      .select('zone_code')
      .eq('warehouse_id', input.warehouse_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNumber = lastZone?.zone_code
      ? parseInt(lastZone.zone_code.replace('ZONE-', ''))
      : 0
    const zoneCode = `ZONE-${(lastNumber + 1).toString().padStart(2, '0')}`

    const { data, error } = await supabase
      .from('warehouse_zones')
      .insert({
        ...input,
        user_id: user.id,
        zone_code: zoneCode
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create warehouse zone', { error, userId: user.id, warehouseId: input.warehouse_id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update zone count on warehouse
    await supabase.rpc('increment_warehouse_zones', { warehouse_id: input.warehouse_id })

    revalidatePath('/dashboard/warehouse-v2')
    logger.info('Warehouse zone created', { userId: user.id, zoneId: data.id, warehouseId: input.warehouse_id })
    return actionSuccess(data, 'Warehouse zone created successfully')
  } catch (error) {
    logger.error('Unexpected error in createWarehouseZone', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateWarehouseZone(input: {
  id: string
  zone_name?: string
  zone_type?: string
  capacity_sqm?: number
  utilization_percent?: number
  product_count?: number
  temperature_min?: number
  temperature_max?: number
  humidity_max?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('warehouse_zones')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update warehouse zone', { error, userId: user.id, zoneId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/warehouse-v2')
    logger.info('Warehouse zone updated', { userId: user.id, zoneId: id })
    return actionSuccess(data, 'Warehouse zone updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateWarehouseZone', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getWarehouseStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: warehouses, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get warehouse stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const active = warehouses.filter(w => w.status === 'active').length
    const totalCapacity = warehouses.reduce((sum, w) => sum + Number(w.capacity_sqm), 0)
    const avgUtilization = warehouses.length > 0
      ? warehouses.reduce((sum, w) => sum + Number(w.utilization_percent), 0) / warehouses.length
      : 0
    const totalStaff = warehouses.reduce((sum, w) => sum + w.staff_count, 0)

    const stats = {
      total: warehouses.length,
      active,
      totalCapacity,
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      totalStaff
    }

    logger.info('Warehouse stats retrieved', { userId: user.id })
    return actionSuccess(stats, 'Warehouse stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error in getWarehouseStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
