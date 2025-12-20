'use server'

/**
 * Extended Materials Server Actions
 * Tables: materials, material_categories, material_inventory, material_suppliers, material_orders, material_usage
 */

import { createClient } from '@/lib/supabase/server'

export async function getMaterial(materialId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('materials').select('*, material_categories(*), material_inventory(*), material_suppliers(*)').eq('id', materialId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMaterial(materialData: { name: string; description?: string; sku?: string; category_id?: string; unit?: string; unit_cost?: number; min_stock?: number; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('materials').insert({ ...materialData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMaterial(materialId: string, updates: Partial<{ name: string; description: string; sku: string; category_id: string; unit: string; unit_cost: number; min_stock: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('materials').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', materialId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMaterial(materialId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('materials').delete().eq('id', materialId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMaterials(options?: { category_id?: string; status?: string; low_stock?: boolean; organization_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('materials').select('*, material_categories(*), material_inventory(*)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateInventory(materialId: string, warehouseId: string, quantity: number, type: 'add' | 'remove' | 'set') {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('material_inventory').select('*').eq('material_id', materialId).eq('warehouse_id', warehouseId).single(); let newQty = quantity; if (existing) { if (type === 'add') newQty = existing.quantity + quantity; else if (type === 'remove') newQty = Math.max(0, existing.quantity - quantity); const { data, error } = await supabase.from('material_inventory').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('material_inventory').insert({ material_id: materialId, warehouse_id: warehouseId, quantity: newQty, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInventory(materialId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('material_inventory').select('*').eq('material_id', materialId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMaterialOrder(orderData: { supplier_id: string; materials: { material_id: string; quantity: number; unit_price: number }[]; expected_delivery?: string; notes?: string }) {
  try { const supabase = await createClient(); const totalAmount = orderData.materials.reduce((sum, m) => sum + m.quantity * m.unit_price, 0); const { data, error } = await supabase.from('material_orders').insert({ supplier_id: orderData.supplier_id, total_amount: totalAmount, expected_delivery: orderData.expected_delivery, notes: orderData.notes, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMaterialOrders(options?: { supplier_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('material_orders').select('*, material_suppliers(*)'); if (options?.supplier_id) query = query.eq('supplier_id', options.supplier_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordUsage(usageData: { material_id: string; quantity: number; project_id?: string; used_by?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('material_usage').insert({ ...usageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUsageHistory(materialId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('material_usage').select('*').eq('material_id', materialId); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('material_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSuppliers(options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('material_suppliers').select('*'); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
