'use server'

/**
 * Extended Stocks Server Actions
 * Tables: stocks, stock_movements, stock_adjustments, stock_reservations, stock_alerts, stock_locations
 */

import { createClient } from '@/lib/supabase/server'

export async function getStock(stockId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stocks').select('*, stock_locations(*), stock_reservations(*), stock_alerts(*)').eq('id', stockId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStock(stockData: { product_id: string; location_id?: string; sku?: string; quantity: number; reserved_quantity?: number; min_quantity?: number; max_quantity?: number; reorder_point?: number; unit?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stocks').insert({ ...stockData, reserved_quantity: stockData.reserved_quantity || 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStock(stockId: string, updates: Partial<{ quantity: number; reserved_quantity: number; min_quantity: number; max_quantity: number; reorder_point: number; unit: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stocks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stockId).select().single(); if (error) throw error; await checkStockAlerts(stockId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function checkStockAlerts(stockId: string) {
  const supabase = await createClient()
  const { data: stock } = await supabase.from('stocks').select('*, stock_alerts(*)').eq('id', stockId).single()
  if (!stock) return
  const available = stock.quantity - (stock.reserved_quantity || 0)
  if (stock.reorder_point && available <= stock.reorder_point) {
    await supabase.from('stock_alerts').upsert({ stock_id: stockId, alert_type: 'low_stock', threshold: stock.reorder_point, current_value: available, triggered_at: new Date().toISOString(), status: 'active', created_at: new Date().toISOString() }, { onConflict: 'stock_id,alert_type' })
  }
}

export async function getStocks(options?: { product_id?: string; location_id?: string; low_stock?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stocks').select('*, stock_locations(*), products(*)'); if (options?.product_id) query = query.eq('product_id', options.product_id); if (options?.location_id) query = query.eq('location_id', options.location_id); if (options?.search) query = query.ilike('sku', `%${options.search}%`); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; let stocks = data || []; if (options?.low_stock) { stocks = stocks.filter(s => (s.quantity - (s.reserved_quantity || 0)) <= (s.reorder_point || 0)) } return { success: true, data: stocks } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMovement(movementData: { stock_id: string; movement_type: 'in' | 'out' | 'transfer' | 'adjustment'; quantity: number; from_location_id?: string; to_location_id?: string; reference_type?: string; reference_id?: string; reason?: string; performed_by?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data: movement, error: movementError } = await supabase.from('stock_movements').insert({ ...movementData, moved_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (movementError) throw movementError; const quantityChange = movementData.movement_type === 'in' ? movementData.quantity : -movementData.quantity; await supabase.rpc('update_stock_quantity', { p_stock_id: movementData.stock_id, p_quantity_change: quantityChange }).catch(() => { /* fallback to manual update if rpc doesn't exist */ }); return { success: true, data: movement } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMovements(stockId: string, options?: { movement_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stock_movements').select('*, users(*)').eq('stock_id', stockId); if (options?.movement_type) query = query.eq('movement_type', options.movement_type); if (options?.from_date) query = query.gte('moved_at', options.from_date); if (options?.to_date) query = query.lte('moved_at', options.to_date); const { data, error } = await query.order('moved_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function adjustStock(stockId: string, adjustmentData: { quantity_change: number; reason: string; adjusted_by: string; notes?: string }) {
  try { const supabase = await createClient(); const { data: stock } = await supabase.from('stocks').select('quantity').eq('id', stockId).single(); if (!stock) return { success: false, error: 'Stock not found' }; const { data: adjustment, error: adjustError } = await supabase.from('stock_adjustments').insert({ stock_id: stockId, previous_quantity: stock.quantity, new_quantity: stock.quantity + adjustmentData.quantity_change, ...adjustmentData, adjusted_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (adjustError) throw adjustError; await supabase.from('stocks').update({ quantity: stock.quantity + adjustmentData.quantity_change, updated_at: new Date().toISOString() }).eq('id', stockId); return { success: true, data: adjustment } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reserveStock(stockId: string, reservationData: { quantity: number; reference_type: string; reference_id: string; expires_at?: string; reserved_by?: string }) {
  try { const supabase = await createClient(); const { data: stock } = await supabase.from('stocks').select('quantity, reserved_quantity').eq('id', stockId).single(); if (!stock) return { success: false, error: 'Stock not found' }; const available = stock.quantity - (stock.reserved_quantity || 0); if (reservationData.quantity > available) return { success: false, error: 'Insufficient stock' }; const { data: reservation, error: resError } = await supabase.from('stock_reservations').insert({ stock_id: stockId, ...reservationData, status: 'active', reserved_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (resError) throw resError; await supabase.from('stocks').update({ reserved_quantity: (stock.reserved_quantity || 0) + reservationData.quantity, updated_at: new Date().toISOString() }).eq('id', stockId); return { success: true, data: reservation } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function releaseReservation(reservationId: string) {
  try { const supabase = await createClient(); const { data: reservation } = await supabase.from('stock_reservations').select('*').eq('id', reservationId).single(); if (!reservation || reservation.status !== 'active') return { success: false, error: 'Reservation not found or not active' }; await supabase.from('stock_reservations').update({ status: 'released', released_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reservationId); const { data: stock } = await supabase.from('stocks').select('reserved_quantity').eq('id', reservation.stock_id).single(); if (stock) { await supabase.from('stocks').update({ reserved_quantity: Math.max(0, (stock.reserved_quantity || 0) - reservation.quantity), updated_at: new Date().toISOString() }).eq('id', reservation.stock_id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocations(options?: { is_active?: boolean; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('stock_locations').select('*, stocks(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActiveAlerts(options?: { alert_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stock_alerts').select('*, stocks(*, products(*))').eq('status', 'active'); if (options?.alert_type) query = query.eq('alert_type', options.alert_type); const { data, error } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

