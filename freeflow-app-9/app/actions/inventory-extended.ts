'use server'

/**
 * Extended Inventory Server Actions
 * Tables: inventory, inventory_items, inventory_movements, inventory_locations
 */

import { createClient } from '@/lib/supabase/server'

export async function getInventoryItem(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('inventory_items').select('*').eq('id', itemId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInventoryItem(itemData: { name: string; sku: string; quantity: number; location_id?: string; category?: string; unit_price?: number; reorder_point?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('inventory_items').insert({ ...itemData, status: 'in_stock', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInventoryItem(itemId: string, updates: Partial<{ name: string; quantity: number; location_id: string; unit_price: number; reorder_point: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('inventory_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInventoryItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('inventory_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInventoryItems(options?: { location_id?: string; category?: string; status?: string; low_stock?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('inventory_items').select('*'); if (options?.location_id) query = query.eq('location_id', options.location_id); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function adjustInventory(itemId: string, adjustment: { quantity: number; reason: string; type: 'add' | 'remove' | 'set'; user_id: string }) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('inventory_items').select('quantity').eq('id', itemId).single(); if (!item) throw new Error('Item not found'); let newQty = adjustment.type === 'set' ? adjustment.quantity : adjustment.type === 'add' ? item.quantity + adjustment.quantity : item.quantity - adjustment.quantity; await supabase.from('inventory_movements').insert({ item_id: itemId, quantity: adjustment.quantity, type: adjustment.type, reason: adjustment.reason, user_id: adjustment.user_id, created_at: new Date().toISOString() }); const { data, error } = await supabase.from('inventory_items').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInventoryMovements(itemId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('inventory_movements').select('*').eq('item_id', itemId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInventoryLocations() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('inventory_locations').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLowStockItems(options?: { threshold?: number; limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('inventory_items').select('*').filter('quantity', 'lte', 'reorder_point').order('quantity', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
