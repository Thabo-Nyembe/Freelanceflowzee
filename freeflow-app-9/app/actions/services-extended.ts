'use server'

/**
 * Extended Services Server Actions
 * Tables: services, service_categories, service_providers, service_bookings, service_pricing, service_reviews
 */

import { createClient } from '@/lib/supabase/server'

export async function getService(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('services').select('*, service_categories(*), service_providers(*), service_pricing(*), service_reviews(count)').eq('id', serviceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createService(serviceData: { name: string; description?: string; category_id?: string; provider_id?: string; duration_minutes?: number; base_price?: number; currency?: string; pricing_type?: 'fixed' | 'hourly' | 'custom'; max_bookings_per_slot?: number; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('services').insert({ ...serviceData, is_active: serviceData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateService(serviceId: string, updates: Partial<{ name: string; description: string; category_id: string; provider_id: string; duration_minutes: number; base_price: number; pricing_type: string; max_bookings_per_slot: number; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('services').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', serviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteService(serviceId: string) {
  try { const supabase = await createClient(); await supabase.from('service_pricing').delete().eq('service_id', serviceId); const { error } = await supabase.from('services').delete().eq('id', serviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getServices(options?: { category_id?: string; provider_id?: string; is_active?: boolean; min_price?: number; max_price?: number; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('services').select('*, service_categories(*), service_providers(*), service_pricing(*), service_reviews(count)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.provider_id) query = query.eq('provider_id', options.provider_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.min_price) query = query.gte('base_price', options.min_price); if (options?.max_price) query = query.lte('base_price', options.max_price); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bookService(bookingData: { service_id: string; customer_id: string; provider_id?: string; scheduled_at: string; duration_minutes?: number; price?: number; notes?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: service } = await supabase.from('services').select('duration_minutes, base_price, max_bookings_per_slot').eq('id', bookingData.service_id).single(); if (!service) return { success: false, error: 'Service not found' }; const endTime = new Date(new Date(bookingData.scheduled_at).getTime() + (bookingData.duration_minutes || service.duration_minutes || 60) * 60000).toISOString(); if (service.max_bookings_per_slot) { const { count } = await supabase.from('service_bookings').select('*', { count: 'exact', head: true }).eq('service_id', bookingData.service_id).neq('status', 'cancelled').or(`and(scheduled_at.lt.${endTime},end_time.gt.${bookingData.scheduled_at})`); if (count && count >= service.max_bookings_per_slot) return { success: false, error: 'No available slots' } } const { data, error } = await supabase.from('service_bookings').insert({ ...bookingData, duration_minutes: bookingData.duration_minutes || service.duration_minutes, price: bookingData.price ?? service.base_price, end_time: endTime, status: 'pending', confirmation_code: `SB-${Date.now()}`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function confirmBooking(bookingId: string, confirmedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('service_bookings').update({ status: 'confirmed', confirmed_at: new Date().toISOString(), confirmed_by: confirmedBy, updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelBooking(bookingId: string, cancelledBy: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('service_bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: cancelledBy, cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeBooking(bookingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('service_bookings').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getServiceBookings(serviceId: string, options?: { from_date?: string; to_date?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('service_bookings').select('*, users(*), service_providers(*)').eq('service_id', serviceId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('scheduled_at', options.from_date); if (options?.to_date) query = query.lte('scheduled_at', options.to_date); const { data, error } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCustomerBookings(customerId: string, options?: { status?: string; upcoming_only?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('service_bookings').select('*, services(*, service_categories(*)), service_providers(*)').eq('customer_id', customerId); if (options?.status) query = query.eq('status', options.status); if (options?.upcoming_only) query = query.gte('scheduled_at', new Date().toISOString()); const { data, error } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServiceCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('service_categories').select('*, services(count)'); if (options?.parent_id !== undefined) { if (options.parent_id === null) query = query.is('parent_id', null); else query = query.eq('parent_id', options.parent_id) } if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServiceProviders(options?: { is_active?: boolean; is_verified?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('service_providers').select('*, services(count), users(*)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_verified !== undefined) query = query.eq('is_verified', options.is_verified); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setServicePricing(serviceId: string, pricing: { type: string; amount: number; currency?: string; effective_from?: string; effective_until?: string; conditions?: any }[]) {
  try { const supabase = await createClient(); await supabase.from('service_pricing').delete().eq('service_id', serviceId); if (pricing.length > 0) { const pricingData = pricing.map(p => ({ service_id: serviceId, ...p, created_at: new Date().toISOString() })); await supabase.from('service_pricing').insert(pricingData) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getServiceAvailability(serviceId: string, date: string) {
  try { const supabase = await createClient(); const { data: service } = await supabase.from('services').select('duration_minutes, max_bookings_per_slot').eq('id', serviceId).single(); if (!service) return { success: false, error: 'Service not found' }; const { data: bookings } = await supabase.from('service_bookings').select('scheduled_at, end_time').eq('service_id', serviceId).neq('status', 'cancelled').gte('scheduled_at', date).lt('scheduled_at', date + 'T23:59:59'); return { success: true, data: { service, bookings: bookings || [], date } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

