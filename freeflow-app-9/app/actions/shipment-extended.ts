'use server'

/**
 * Extended Shipment Server Actions - Covers all Shipment-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getShipments(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('shipments').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShipment(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipments').select('*').eq('id', shipmentId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShipment(userId: string, input: { order_id: string; carrier_id: string; origin_address: any; destination_address: any; weight?: number; dimensions?: any; shipping_method?: string }) {
  try { const supabase = await createClient(); const trackingNumber = `SHP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`; const { data, error } = await supabase.from('shipments').insert({ user_id: userId, tracking_number: trackingNumber, status: 'pending', ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShipmentStatus(shipmentId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'shipped') updates.shipped_at = new Date().toISOString(); if (status === 'delivered') updates.delivered_at = new Date().toISOString(); const { data, error } = await supabase.from('shipments').update(updates).eq('id', shipmentId).select().single(); if (error) throw error; if (notes) { await supabase.from('shipment_tracking').insert({ shipment_id: shipmentId, status, notes, timestamp: new Date().toISOString() }); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelShipment(shipmentId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipments').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason }).eq('id', shipmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShipmentTracking(shipmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_tracking').select('*').eq('shipment_id', shipmentId).order('timestamp', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTrackingEvent(shipmentId: string, input: { status: string; location?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_tracking').insert({ shipment_id: shipmentId, ...input, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShipmentCarriers(activeOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('shipment_carriers').select('*').order('name', { ascending: true }); if (activeOnly) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createShipmentCarrier(input: { name: string; code: string; tracking_url_template?: string; api_endpoint?: string; api_key?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_carriers').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShipmentCarrier(carrierId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_carriers').update(updates).eq('id', carrierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleShipmentCarrier(carrierId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipment_carriers').update({ is_active: isActive }).eq('id', carrierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function calculateShippingRate(carrierId: string, weight: number, origin: string, destination: string) {
  try { const supabase = await createClient(); const { data: carrier, error } = await supabase.from('shipment_carriers').select('rates').eq('id', carrierId).single(); if (error) throw error; const baseRate = carrier?.rates?.base || 5.99; const perKgRate = carrier?.rates?.per_kg || 0.50; const estimatedRate = baseRate + (weight * perKgRate); return { success: true, data: { carrier_id: carrierId, weight, origin, destination, estimated_rate: estimatedRate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
