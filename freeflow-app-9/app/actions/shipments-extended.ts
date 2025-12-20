'use server'

/**
 * Extended Shipments Server Actions
 * Tables: shipments, shipment_items, shipment_tracking, shipment_labels, shipment_rates, shipment_carriers
 */

import { createClient } from '@/lib/supabase/server'

export async function getShipment(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipments').select('*, shipment_items(*), shipment_tracking(*), shipment_labels(*), shipment_carriers(*), orders(*)').eq('id', shipmentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShipment(shipmentData: { order_id: string; carrier_id?: string; origin_address: any; destination_address: any; shipping_method?: string; weight?: number; dimensions?: { length: number; width: number; height: number }; items?: { order_item_id: string; quantity: number }[]; notes?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { items, ...shipmentInfo } = shipmentData; const trackingNumber = `SHP-${Date.now()}`; const { data: shipment, error: shipmentError } = await supabase.from('shipments').insert({ ...shipmentInfo, tracking_number: trackingNumber, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (shipmentError) throw shipmentError; if (items && items.length > 0) { const itemsData = items.map(i => ({ shipment_id: shipment.id, ...i, created_at: new Date().toISOString() })); await supabase.from('shipment_items').insert(itemsData) } await addTrackingEvent(shipment.id, 'created', 'Shipment created'); return { success: true, data: shipment } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShipment(shipmentId: string, updates: Partial<{ carrier_id: string; shipping_method: string; weight: number; dimensions: any; estimated_delivery: string; notes: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', shipmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShipmentStatus(shipmentId: string, status: string, location?: string, notes?: string) {
  try { const supabase = await createClient(); const statusMap: { [key: string]: string } = { 'processing': 'Processing shipment', 'label_created': 'Shipping label created', 'picked_up': 'Package picked up by carrier', 'in_transit': 'Package in transit', 'out_for_delivery': 'Out for delivery', 'delivered': 'Package delivered', 'failed_delivery': 'Delivery attempt failed', 'returned': 'Package returned' }; const { data, error } = await supabase.from('shipments').update({ status, ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}), ...(status === 'picked_up' ? { shipped_at: new Date().toISOString() } : {}), updated_at: new Date().toISOString() }).eq('id', shipmentId).select().single(); if (error) throw error; await addTrackingEvent(shipmentId, status, statusMap[status] || notes || status, location); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function addTrackingEvent(shipmentId: string, status: string, description: string, location?: string) {
  const supabase = await createClient()
  await supabase.from('shipment_tracking').insert({ shipment_id: shipmentId, status, description, location, tracked_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getShipments(options?: { order_id?: string; carrier_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('shipments').select('*, shipment_items(count), shipment_carriers(*), orders(*)'); if (options?.order_id) query = query.eq('order_id', options.order_id); if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.search) query = query.ilike('tracking_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShipmentTracking(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_tracking').select('*').eq('shipment_id', shipmentId).order('tracked_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackByNumber(trackingNumber: string) {
  try { const supabase = await createClient(); const { data: shipment, error: shipmentError } = await supabase.from('shipments').select('*, shipment_carriers(*)').eq('tracking_number', trackingNumber).single(); if (shipmentError && shipmentError.code !== 'PGRST116') throw shipmentError; if (!shipment) return { success: false, error: 'Shipment not found' }; const { data: tracking } = await supabase.from('shipment_tracking').select('*').eq('shipment_id', shipment.id).order('tracked_at', { ascending: false }); return { success: true, data: { shipment, tracking: tracking || [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShippingLabel(shipmentId: string, labelData: { carrier_id: string; label_url?: string; label_format?: string; cost?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_labels').insert({ shipment_id: shipmentId, ...labelData, status: 'created', generated_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await updateShipmentStatus(shipmentId, 'label_created'); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShipmentLabel(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_labels').select('*, shipment_carriers(*)').eq('shipment_id', shipmentId).order('generated_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShippingRates(params: { origin_address: any; destination_address: any; weight: number; dimensions?: any }) {
  try { const supabase = await createClient(); const { data: carriers } = await supabase.from('shipment_carriers').select('*').eq('is_active', true); const rates = (carriers || []).map(carrier => ({ carrier_id: carrier.id, carrier_name: carrier.name, service_type: 'standard', estimated_days: 5, rate: Math.round((params.weight * 2 + 5) * 100) / 100, currency: 'USD' })); return { success: true, data: rates } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCarriers(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('shipment_carriers').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShipmentStats(options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('shipments').select('status'); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const shipments = data || []; const total = shipments.length; const pending = shipments.filter(s => s.status === 'pending').length; const inTransit = shipments.filter(s => s.status === 'in_transit').length; const delivered = shipments.filter(s => s.status === 'delivered').length; const failed = shipments.filter(s => s.status === 'failed_delivery').length; return { success: true, data: { total, pending, inTransit, delivered, failed } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelShipment(shipmentId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipments').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', shipmentId).select().single(); if (error) throw error; await addTrackingEvent(shipmentId, 'cancelled', reason || 'Shipment cancelled'); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

