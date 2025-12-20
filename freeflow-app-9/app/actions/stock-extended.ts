'use server'

/**
 * Extended Stock Server Actions - Covers all Stock-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getStockItems(warehouseId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('stock_items').select('*').order('name', { ascending: true }); if (warehouseId) query = query.eq('warehouse_id', warehouseId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStockItem(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stock_items').select('*').eq('id', itemId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStockItem(input: { sku: string; name: string; description?: string; category?: string; unit?: string; cost_price?: number; sell_price?: number; quantity: number; reorder_level?: number; warehouse_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stock_items').insert({ ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStockItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stock_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function adjustStockQuantity(itemId: string, adjustment: number, reason: string, userId: string) {
  try { const supabase = await createClient(); const { data: item, error: itemError } = await supabase.from('stock_items').select('quantity').eq('id', itemId).single(); if (itemError) throw itemError; const newQuantity = (item?.quantity || 0) + adjustment; const { data, error } = await supabase.from('stock_items').update({ quantity: newQuantity, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; await supabase.from('stock_movements').insert({ item_id: itemId, movement_type: adjustment > 0 ? 'in' : 'out', quantity: Math.abs(adjustment), reason, performed_by: userId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStockItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('stock_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLowStockItems(threshold?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stock_items').select('*').lt('quantity', threshold || 10).order('quantity', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStockMovements(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stock_movements').select('*').eq('item_id', itemId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStockMovement(input: { item_id: string; movement_type: string; quantity: number; reason?: string; reference_id?: string; reference_type?: string; performed_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stock_movements').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function transferStock(itemId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, userId: string) {
  try { const supabase = await createClient(); await supabase.from('stock_movements').insert([{ item_id: itemId, warehouse_id: fromWarehouseId, movement_type: 'transfer_out', quantity, reason: `Transfer to warehouse ${toWarehouseId}`, performed_by: userId }, { item_id: itemId, warehouse_id: toWarehouseId, movement_type: 'transfer_in', quantity, reason: `Transfer from warehouse ${fromWarehouseId}`, performed_by: userId }]); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStockValueReport(warehouseId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('stock_items').select('quantity, cost_price, sell_price'); if (warehouseId) query = query.eq('warehouse_id', warehouseId); const { data, error } = await query; if (error) throw error; const totalCost = data?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost_price || 0)), 0) || 0; const totalValue = data?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.sell_price || 0)), 0) || 0; return { success: true, data: { total_items: data?.length || 0, total_cost: totalCost, total_value: totalValue, potential_profit: totalValue - totalCost } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
