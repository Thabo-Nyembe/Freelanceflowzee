'use server'

/**
 * Extended Logistics Server Actions
 * Tables: logistics_shipments, logistics_carriers, logistics_routes, logistics_tracking, logistics_warehouses, logistics_inventory
 */

import { createClient } from '@/lib/supabase/server'

export async function getShipment(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_shipments').select('*, logistics_carriers(*), logistics_tracking(*)').eq('id', shipmentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShipment(shipmentData: { order_id?: string; carrier_id?: string; origin_address: any; destination_address: any; weight_kg?: number; dimensions?: any; shipping_method?: string; created_by?: string }) {
  try { const supabase = await createClient(); const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`; const { data, error } = await supabase.from('logistics_shipments').insert({ ...shipmentData, tracking_number: trackingNumber, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await addTrackingEvent(data.id, 'created', 'Shipment created'); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShipment(shipmentId: string, updates: Partial<{ carrier_id: string; status: string; shipping_method: string; estimated_delivery: string; actual_delivery: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_shipments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', shipmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShipments(options?: { status?: string; carrier_id?: string; order_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('logistics_shipments').select('*, logistics_carriers(*)'); if (options?.status) query = query.eq('status', options.status); if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id); if (options?.order_id) query = query.eq('order_id', options.order_id); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTrackingEvent(shipmentId: string, status: string, description: string, location?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_tracking').insert({ shipment_id: shipmentId, status, description, location, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('logistics_shipments').update({ status, updated_at: new Date().toISOString() }).eq('id', shipmentId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrackingHistory(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_tracking').select('*').eq('shipment_id', shipmentId).order('timestamp', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackByNumber(trackingNumber: string) {
  try { const supabase = await createClient(); const { data: shipment, error } = await supabase.from('logistics_shipments').select('*, logistics_carriers(*), logistics_tracking(*)').eq('tracking_number', trackingNumber).single(); if (error && error.code !== 'PGRST116') throw error; if (!shipment) return { success: false, error: 'Tracking number not found' }; return { success: true, data: shipment } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCarriers(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('logistics_carriers').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCarrier(carrierData: { name: string; code: string; tracking_url_template?: string; contact_email?: string; contact_phone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_carriers').insert({ ...carrierData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWarehouses(options?: { is_active?: boolean; region?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('logistics_warehouses').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.region) query = query.eq('region', options.region); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWarehouse(warehouseData: { name: string; code: string; address: any; region?: string; capacity?: number; manager_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_warehouses').insert({ ...warehouseData, is_active: true, current_capacity: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWarehouseInventory(warehouseId: string, options?: { product_id?: string; low_stock?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('logistics_inventory').select('*').eq('warehouse_id', warehouseId); if (options?.product_id) query = query.eq('product_id', options.product_id); if (options?.low_stock) query = query.lt('quantity', supabase.raw('reorder_point')); const { data, error } = await query.order('product_id', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateInventory(warehouseId: string, productId: string, quantity: number, operation: 'add' | 'remove' | 'set') {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('logistics_inventory').select('quantity').eq('warehouse_id', warehouseId).eq('product_id', productId).single(); let newQuantity = operation === 'set' ? quantity : operation === 'add' ? (current?.quantity || 0) + quantity : Math.max(0, (current?.quantity || 0) - quantity); const { data, error } = await supabase.from('logistics_inventory').upsert({ warehouse_id: warehouseId, product_id: productId, quantity: newQuantity, updated_at: new Date().toISOString() }, { onConflict: 'warehouse_id,product_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRoute(routeData: { name: string; origin_warehouse_id: string; destination_warehouse_id: string; carrier_id?: string; estimated_duration_hours?: number; cost?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logistics_routes').insert({ ...routeData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoutes(options?: { origin_id?: string; destination_id?: string; carrier_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('logistics_routes').select('*, origin:logistics_warehouses!origin_warehouse_id(*), destination:logistics_warehouses!destination_warehouse_id(*), logistics_carriers(*)'); if (options?.origin_id) query = query.eq('origin_warehouse_id', options.origin_id); if (options?.destination_id) query = query.eq('destination_warehouse_id', options.destination_id); if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id); const { data, error } = await query.eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
