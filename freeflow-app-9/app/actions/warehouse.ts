'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createWarehouse(input: CreateWarehouseInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/warehouse-v2')
  return { data }
}

export async function updateWarehouse(input: UpdateWarehouseInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('warehouses')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/warehouse-v2')
  return { data }
}

export async function deleteWarehouse(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('warehouses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/warehouse-v2')
  return { success: true }
}

export async function createWarehouseZone(input: {
  warehouse_id: string
  zone_name: string
  zone_type?: string
  capacity_sqm?: number
  temperature_min?: number
  temperature_max?: number
  humidity_max?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  // Update zone count on warehouse
  await supabase.rpc('increment_warehouse_zones', { warehouse_id: input.warehouse_id })

  revalidatePath('/dashboard/warehouse-v2')
  return { data }
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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('warehouse_zones')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/warehouse-v2')
  return { data }
}

export async function getWarehouseStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: warehouses, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) {
    return { error: error.message }
  }

  const active = warehouses.filter(w => w.status === 'active').length
  const totalCapacity = warehouses.reduce((sum, w) => sum + Number(w.capacity_sqm), 0)
  const avgUtilization = warehouses.length > 0
    ? warehouses.reduce((sum, w) => sum + Number(w.utilization_percent), 0) / warehouses.length
    : 0
  const totalStaff = warehouses.reduce((sum, w) => sum + w.staff_count, 0)

  return {
    data: {
      total: warehouses.length,
      active,
      totalCapacity,
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      totalStaff
    }
  }
}
