'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createInventoryItem(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: item, error } = await supabase
    .from('inventory')
    .insert({
      ...data,
      user_id: user.id,
      available_quantity: data.quantity || 0
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function updateInventoryItem(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: item, error } = await supabase
    .from('inventory')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function deleteInventoryItem(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: item, error } = await supabase
    .from('inventory')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function adjustStock(id: string, quantityChange: number, reason: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current quantity
  const { data: current } = await supabase
    .from('inventory')
    .select('quantity, reserved_quantity')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Inventory item not found')

  const newQuantity = current.quantity + quantityChange
  const availableQuantity = newQuantity - current.reserved_quantity

  // Determine status
  let status = 'in-stock'
  let lowStockAlert = false
  let outOfStockAlert = false

  const { data: reorderInfo } = await supabase
    .from('inventory')
    .select('reorder_point')
    .eq('id', id)
    .single()

  if (newQuantity === 0) {
    status = 'out-of-stock'
    outOfStockAlert = true
  } else if (reorderInfo && newQuantity <= reorderInfo.reorder_point) {
    status = 'low-stock'
    lowStockAlert = true
  }

  const { data: item, error } = await supabase
    .from('inventory')
    .update({
      quantity: newQuantity,
      available_quantity: availableQuantity,
      status,
      low_stock_alert: lowStockAlert,
      out_of_stock_alert: outOfStockAlert,
      last_restocked_at: quantityChange > 0 ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function reserveStock(id: string, quantity: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('inventory')
    .select('quantity, reserved_quantity')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Inventory item not found')

  const newReserved = current.reserved_quantity + quantity
  const availableQuantity = current.quantity - newReserved

  if (availableQuantity < 0) {
    throw new Error('Insufficient stock available')
  }

  const { data: item, error } = await supabase
    .from('inventory')
    .update({
      reserved_quantity: newReserved,
      available_quantity: availableQuantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function updatePricing(id: string, unitPrice: number, costPrice?: number, sellingPrice?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Inventory item not found')

  const totalValue = unitPrice * current.quantity

  const { data: item, error } = await supabase
    .from('inventory')
    .update({
      unit_price: unitPrice,
      cost_price: costPrice ?? unitPrice,
      selling_price: sellingPrice ?? unitPrice,
      total_value: totalValue,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function checkReorderAlerts(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: item } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!item) throw new Error('Inventory item not found')

  const needsReorder = item.quantity <= item.reorder_point

  if (needsReorder) {
    const { data: updated, error } = await supabase
      .from('inventory')
      .update({
        status: 'on-order',
        low_stock_alert: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/dashboard/inventory-v2')
    return { needsReorder: true, item: updated }
  }

  return { needsReorder: false, item }
}

export async function recordSale(id: string, quantitySold: number, saleAmount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('inventory')
    .select('quantity, reserved_quantity, total_sales, total_revenue')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Inventory item not found')

  const newQuantity = current.quantity - quantitySold
  const availableQuantity = newQuantity - current.reserved_quantity
  const totalSales = current.total_sales + quantitySold
  const totalRevenue = current.total_revenue + saleAmount

  const { data: item, error } = await supabase
    .from('inventory')
    .update({
      quantity: newQuantity,
      available_quantity: availableQuantity,
      total_sales: totalSales,
      total_revenue: totalRevenue,
      last_sold_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return item
}

export async function updateTurnoverRate(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: item } = await supabase
    .from('inventory')
    .select('quantity, total_sales, days_in_stock')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!item) throw new Error('Inventory item not found')

  const avgInventory = (item.quantity + item.total_sales) / 2
  const turnoverRate = avgInventory > 0
    ? parseFloat((item.total_sales / avgInventory).toFixed(2))
    : 0

  const sellThroughRate = (item.quantity + item.total_sales) > 0
    ? parseFloat(((item.total_sales / (item.quantity + item.total_sales)) * 100).toFixed(2))
    : 0

  const { data: updated, error } = await supabase
    .from('inventory')
    .update({
      turnover_rate: turnoverRate,
      sell_through_rate: sellThroughRate,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/inventory-v2')
  return updated
}
