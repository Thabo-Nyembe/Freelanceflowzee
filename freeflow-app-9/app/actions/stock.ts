'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateStockMovementInput {
  movement_type: string
  product_name: string
  sku?: string
  quantity: number
  unit_price?: number
  from_location?: string
  to_location?: string
  from_warehouse_id?: string
  to_warehouse_id?: string
  reference_number?: string
  reference_type?: string
  operator_name?: string
  notes?: string
  batch_number?: string
  expiry_date?: string
}

export interface UpdateStockMovementInput extends Partial<CreateStockMovementInput> {
  id: string
  status?: string
  completed_at?: string
}

export async function createStockMovement(input: CreateStockMovementInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Generate movement number
  const { data: lastMovement } = await supabase
    .from('stock_movements')
    .select('movement_number')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const lastNumber = lastMovement?.movement_number
    ? parseInt(lastMovement.movement_number.replace('MOV-', ''))
    : 0
  const movementNumber = `MOV-${(lastNumber + 1).toString().padStart(4, '0')}`

  // Calculate total value
  const totalValue = (input.unit_price || 0) * input.quantity
  const adjustedQuantity = input.movement_type === 'outbound' ? -Math.abs(input.quantity) : input.quantity

  const { data, error } = await supabase
    .from('stock_movements')
    .insert({
      ...input,
      user_id: user.id,
      movement_number: movementNumber,
      quantity: adjustedQuantity,
      total_value: input.movement_type === 'outbound' ? -Math.abs(totalValue) : totalValue,
      status: input.movement_type === 'transfer' ? 'in-transit' : 'pending',
      movement_date: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/stock-v2')
  return { data }
}

export async function updateStockMovement(input: UpdateStockMovementInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('stock_movements')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/stock-v2')
  return { data }
}

export async function completeStockMovement(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('stock_movements')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update stock levels based on movement
  const movement = data
  if (movement) {
    // This would update stock_levels table based on movement type
    // Implementation depends on business logic
  }

  revalidatePath('/dashboard/stock-v2')
  return { data }
}

export async function cancelStockMovement(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('stock_movements')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/stock-v2')
  return { data }
}

export async function updateStockLevel(input: {
  id?: string
  warehouse_id?: string
  zone_id?: string
  product_name: string
  sku?: string
  quantity_on_hand?: number
  quantity_reserved?: number
  reorder_point?: number
  reorder_quantity?: number
  unit_cost?: number
  location_code?: string
  batch_number?: string
  expiry_date?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...levelData } = input

  // Calculate derived fields
  const quantity_available = (levelData.quantity_on_hand || 0) - (levelData.quantity_reserved || 0)
  const total_value = (levelData.quantity_on_hand || 0) * (levelData.unit_cost || 0)

  if (id) {
    // Update existing
    const { data, error } = await supabase
      .from('stock_levels')
      .update({
        ...levelData,
        quantity_available,
        total_value,
        last_movement_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/stock-v2')
    return { data }
  } else {
    // Create new
    const { data, error } = await supabase
      .from('stock_levels')
      .insert({
        ...levelData,
        user_id: user.id,
        quantity_available,
        total_value
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/stock-v2')
    return { data }
  }
}

export async function getStockStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get today's movements
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: movements, error } = await supabase
    .from('stock_movements')
    .select('movement_type, quantity, total_value, status')
    .eq('user_id', user.id)
    .gte('movement_date', today.toISOString())

  if (error) {
    return { error: error.message }
  }

  const inbound = movements.filter(m => m.movement_type === 'inbound')
  const outbound = movements.filter(m => m.movement_type === 'outbound')

  const totalInboundQty = inbound.reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  const totalOutboundQty = outbound.reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  const totalInboundValue = inbound.reduce((sum, m) => sum + Math.abs(Number(m.total_value)), 0)
  const totalOutboundValue = outbound.reduce((sum, m) => sum + Math.abs(Number(m.total_value)), 0)

  return {
    data: {
      totalMovements: movements.length,
      inboundCount: inbound.length,
      outboundCount: outbound.length,
      totalInboundQty,
      totalOutboundQty,
      totalInboundValue,
      totalOutboundValue,
      netValue: totalInboundValue - totalOutboundValue
    }
  }
}
