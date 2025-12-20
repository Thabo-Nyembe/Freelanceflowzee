'use server'

/**
 * Extended Warehouse Server Actions - Covers all Warehouse-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getWarehouses(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('warehouses').select('*').order('name', { ascending: true }); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWarehouse(warehouseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').select('*').eq('id', warehouseId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWarehouse(input: { name: string; code: string; address?: any; organization_id?: string; manager_id?: string; capacity?: number; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').insert({ ...input, is_active: true, current_occupancy: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWarehouse(warehouseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', warehouseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleWarehouse(warehouseId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').update({ is_active: isActive }).eq('id', warehouseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWarehouse(warehouseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('warehouses').delete().eq('id', warehouseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWarehouseZones(warehouseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouse_zones').select('*').eq('warehouse_id', warehouseId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWarehouseZone(warehouseId: string, input: { name: string; code: string; type?: string; capacity?: number; temperature_controlled?: boolean; temperature_range?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouse_zones').insert({ warehouse_id: warehouseId, ...input, is_active: true, current_occupancy: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWarehouseZone(zoneId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouse_zones').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', zoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleWarehouseZone(zoneId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouse_zones').update({ is_active: isActive }).eq('id', zoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWarehouseZone(zoneId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('warehouse_zones').delete().eq('id', zoneId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWarehouseCapacity(warehouseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('warehouses').select('capacity, current_occupancy').eq('id', warehouseId).single(); if (error) throw error; const utilization = data?.capacity ? (data.current_occupancy / data.capacity) * 100 : 0; return { success: true, data: { ...data, utilization_percentage: utilization } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWarehouseOccupancy(warehouseId: string, change: number) {
  try { const supabase = await createClient(); const { data: warehouse, error: warehouseError } = await supabase.from('warehouses').select('current_occupancy').eq('id', warehouseId).single(); if (warehouseError) throw warehouseError; const newOccupancy = Math.max(0, (warehouse?.current_occupancy || 0) + change); const { data, error } = await supabase.from('warehouses').update({ current_occupancy: newOccupancy }).eq('id', warehouseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWarehousesByUtilization(organizationId?: string, threshold = 80) {
  try { const supabase = await createClient(); let query = supabase.from('warehouses').select('*').eq('is_active', true); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query; if (error) throw error; const highUtilization = data?.filter(w => w.capacity && (w.current_occupancy / w.capacity) * 100 >= threshold) || []; return { success: true, data: highUtilization } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
