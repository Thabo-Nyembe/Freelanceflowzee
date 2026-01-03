'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('inventory-actions')

export async function createInventoryItem(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: item, error } = await supabase
      .from('inventory')
      .insert({
        ...data,
        user_id: user.id,
        available_quantity: data.quantity || 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create inventory item', { error: error.message, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Inventory item created successfully', { itemId: item.id })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Inventory item created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating inventory item', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateInventoryItem(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update inventory item', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Inventory item updated successfully', { itemId: id })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Inventory item updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating inventory item', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteInventoryItem(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: item, error } = await supabase
      .from('inventory')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to delete inventory item', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Inventory item deleted successfully', { itemId: id })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Inventory item deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting inventory item', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function adjustStock(id: string, quantityChange: number, reason: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current quantity
    const { data: current } = await supabase
      .from('inventory')
      .select('quantity, reserved_quantity')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Inventory item not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to adjust stock', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Stock adjusted successfully', { itemId: id, quantityChange })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Stock adjusted successfully')
  } catch (error: any) {
    logger.error('Unexpected error adjusting stock', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function reserveStock(id: string, quantity: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('inventory')
      .select('quantity, reserved_quantity')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Inventory item not found', 'NOT_FOUND')
    }

    const newReserved = current.reserved_quantity + quantity
    const availableQuantity = current.quantity - newReserved

    if (availableQuantity < 0) {
      return actionError('Insufficient stock available', 'VALIDATION_ERROR')
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

    if (error) {
      logger.error('Failed to reserve stock', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Stock reserved successfully', { itemId: id, quantity })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Stock reserved successfully')
  } catch (error: any) {
    logger.error('Unexpected error reserving stock', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePricing(id: string, unitPrice: number, costPrice?: number, sellingPrice?: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Inventory item not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to update pricing', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Pricing updated successfully', { itemId: id })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Pricing updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating pricing', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function checkReorderAlerts(id: string): Promise<ActionResult<{ needsReorder: boolean; item: any }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: item } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!item) {
      return actionError('Inventory item not found', 'NOT_FOUND')
    }

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

      if (error) {
        logger.error('Failed to check reorder alerts', { error: error.message, id })
        return actionError(error.message, 'DATABASE_ERROR')
      }

      logger.info('Reorder alert checked - needs reorder', { itemId: id })
      revalidatePath('/dashboard/inventory-v2')
      return actionSuccess({ needsReorder: true, item: updated }, 'Item needs reordering')
    }

    logger.info('Reorder alert checked - no reorder needed', { itemId: id })
    return actionSuccess({ needsReorder: false, item }, 'No reorder needed')
  } catch (error: any) {
    logger.error('Unexpected error checking reorder alerts', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordSale(id: string, quantitySold: number, saleAmount: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('inventory')
      .select('quantity, reserved_quantity, total_sales, total_revenue')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      return actionError('Inventory item not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to record sale', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Sale recorded successfully', { itemId: id, quantitySold, saleAmount })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(item, 'Sale recorded successfully')
  } catch (error: any) {
    logger.error('Unexpected error recording sale', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTurnoverRate(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: item } = await supabase
      .from('inventory')
      .select('quantity, total_sales, days_in_stock')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!item) {
      return actionError('Inventory item not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to update turnover rate', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Turnover rate updated successfully', { itemId: id, turnoverRate })
    revalidatePath('/dashboard/inventory-v2')
    return actionSuccess(updated, 'Turnover rate updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating turnover rate', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
