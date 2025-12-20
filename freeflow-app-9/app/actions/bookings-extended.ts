'use server'

/**
 * Extended Bookings Server Actions
 * Tables: bookings, booking_slots, booking_services, booking_reminders
 */

import { createClient } from '@/lib/supabase/server'

export async function getBooking(bookingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').select('*, booking_services(*)').eq('id', bookingId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBooking(bookingData: { user_id: string; provider_id: string; service_id?: string; start_time: string; end_time: string; title?: string; notes?: string; attendee_email?: string; attendee_name?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').insert({ ...bookingData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBooking(bookingId: string, updates: Partial<{ start_time: string; end_time: string; title: string; notes: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelBooking(bookingId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').update({ status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function confirmBooking(bookingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeBooking(bookingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookings(options?: { user_id?: string; provider_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('bookings').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.provider_id) query = query.eq('provider_id', options.provider_id); if (options?.status) query = query.eq('status', options.status); if (options?.date_from) query = query.gte('start_time', options.date_from); if (options?.date_to) query = query.lte('start_time', options.date_to); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAvailableSlots(providerId: string, date: string, serviceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('booking_slots').select('*').eq('provider_id', providerId).eq('date', date).eq('is_available', true); if (serviceId) query = query.eq('service_id', serviceId); const { data, error } = await query.order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBookingServices(providerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_services').select('*').eq('provider_id', providerId).eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function rescheduleBooking(bookingId: string, newStartTime: string, newEndTime: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookings').update({ start_time: newStartTime, end_time: newEndTime, status: 'rescheduled', rescheduled_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingStats(providerId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('bookings').select('status').eq('provider_id', providerId); if (options?.date_from) query = query.gte('start_time', options.date_from); if (options?.date_to) query = query.lte('start_time', options.date_to); const { data } = await query; if (!data) return { success: true, data: { total: 0, byStatus: {} } }; const total = data.length; const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {}); return { success: true, data: { total, byStatus } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, byStatus: {} } } }
}
