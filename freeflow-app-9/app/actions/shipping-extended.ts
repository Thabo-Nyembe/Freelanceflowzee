'use server'

/**
 * Extended Shipping Server Actions
 * Tables: shipping_rates, shipping_zones, shipping_methods, shipping_carriers
 */

import { createClient } from '@/lib/supabase/server'

export async function getShippingRate(rateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipping_rates').select('*').eq('id', rateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShippingRate(rateData: { name: string; zone_id?: string; method_id?: string; price: number; currency?: string; conditions?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipping_rates').insert({ ...rateData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShippingRate(rateId: string, updates: Partial<{ name: string; price: number; conditions: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipping_rates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', rateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShippingRates(options?: { zone_id?: string; method_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('shipping_rates').select('*'); if (options?.zone_id) query = query.eq('zone_id', options.zone_id); if (options?.method_id) query = query.eq('method_id', options.method_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShippingZones(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('shipping_zones').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShippingMethods(options?: { is_active?: boolean; carrier_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('shipping_methods').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShippingCarriers(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('shipping_carriers').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function calculateShippingRate(zoneId: string, weight: number, dimensions?: { length: number; width: number; height: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shipping_rates').select('*').eq('zone_id', zoneId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
