'use server'

/**
 * Extended Warehouses Server Actions
 * Tables: warehouses, warehouse_locations, warehouse_inventory, warehouse_transfers
 */

import { createClient } from '@/lib/supabase/server'

export async function getWarehouse(warehouseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').select('*, warehouse_locations(*)').eq('id', warehouseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWarehouse(warehouseData: { name: string; address?: string; city?: string; country?: string; capacity?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').insert({ ...warehouseData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWarehouse(warehouseId: string, updates: Partial<{ name: string; address: string; city: string; country: string; status: string; capacity: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', warehouseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWarehouse(warehouseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('warehouses').delete().eq('id', warehouseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWarehouses(options?: { status?: string; city?: string; country?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('warehouses').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.city) query = query.eq('city', options.city); if (options?.country) query = query.eq('country', options.country); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWarehouseLocations(warehouseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouse_locations').select('*').eq('warehouse_id', warehouseId).order('code', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWarehouseInventory(warehouseId: string, options?: { product_id?: string; low_stock?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('warehouse_inventory').select('*').eq('warehouse_id', warehouseId); if (options?.product_id) query = query.eq('product_id', options.product_id); if (options?.low_stock) query = query.lt('quantity', 10); const { data, error } = await query.order('product_id', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWarehouseTransfers(options?: { from_warehouse_id?: string; to_warehouse_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('warehouse_transfers').select('*'); if (options?.from_warehouse_id) query = query.eq('from_warehouse_id', options.from_warehouse_id); if (options?.to_warehouse_id) query = query.eq('to_warehouse_id', options.to_warehouse_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
