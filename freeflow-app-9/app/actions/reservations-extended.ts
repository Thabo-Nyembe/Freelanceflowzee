'use server'

/**
 * Extended Reservations Server Actions
 * Tables: reservations, reservation_items, reservation_slots, reservation_resources, reservation_rules, reservation_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getReservation(reservationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservations').select('*, reservation_items(*), reservation_resources(*), users(*), reservation_history(*)').eq('id', reservationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReservation(reservationData: { resource_id: string; user_id: string; start_time: string; end_time: string; title?: string; description?: string; guests?: number; items?: { name: string; quantity: number }[]; metadata?: any }) {
  try { const supabase = await createClient(); const { items, ...reservationInfo } = reservationData; const available = await checkAvailability(reservationData.resource_id, reservationData.start_time, reservationData.end_time); if (!available.success || !available.available) return { success: false, error: 'Time slot not available' }; const confirmationCode = generateConfirmationCode(); const { data: reservation, error: reservationError } = await supabase.from('reservations').insert({ ...reservationInfo, confirmation_code: confirmationCode, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (reservationError) throw reservationError; if (items && items.length > 0) { const itemsData = items.map(item => ({ reservation_id: reservation.id, ...item, created_at: new Date().toISOString() })); await supabase.from('reservation_items').insert(itemsData) } await supabase.from('reservation_history').insert({ reservation_id: reservation.id, action: 'created', user_id: reservationData.user_id, created_at: new Date().toISOString() }); return { success: true, data: reservation } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) { code += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return code
}

export async function updateReservation(reservationId: string, updates: Partial<{ start_time: string; end_time: string; title: string; description: string; guests: number; status: string }>, userId?: string) {
  try { const supabase = await createClient(); if (updates.start_time || updates.end_time) { const { data: current } = await supabase.from('reservations').select('resource_id, start_time, end_time').eq('id', reservationId).single(); const available = await checkAvailability(current.resource_id, updates.start_time || current.start_time, updates.end_time || current.end_time, reservationId); if (!available.success || !available.available) return { success: false, error: 'Time slot not available' } } const { data, error } = await supabase.from('reservations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', reservationId).select().single(); if (error) throw error; await supabase.from('reservation_history').insert({ reservation_id: reservationId, action: 'updated', user_id: userId, changes: updates, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function confirmReservation(reservationId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservations').update({ status: 'confirmed', confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reservationId).select().single(); if (error) throw error; await supabase.from('reservation_history').insert({ reservation_id: reservationId, action: 'confirmed', user_id: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelReservation(reservationId: string, userId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservations').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', reservationId).select().single(); if (error) throw error; await supabase.from('reservation_history').insert({ reservation_id: reservationId, action: 'cancelled', user_id: userId, details: { reason }, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkInReservation(reservationId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservations').update({ status: 'checked_in', checked_in_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reservationId).select().single(); if (error) throw error; await supabase.from('reservation_history').insert({ reservation_id: reservationId, action: 'checked_in', user_id: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeReservation(reservationId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservations').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reservationId).select().single(); if (error) throw error; await supabase.from('reservation_history').insert({ reservation_id: reservationId, action: 'completed', user_id: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkAvailability(resourceId: string, startTime: string, endTime: string, excludeReservationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('reservations').select('id').eq('resource_id', resourceId).in('status', ['pending', 'confirmed', 'checked_in']).or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`); if (excludeReservationId) query = query.neq('id', excludeReservationId); const { data, error } = await query; if (error) throw error; return { success: true, available: !data || data.length === 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', available: false } }
}

export async function getReservations(options?: { resource_id?: string; user_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reservations').select('*, reservation_resources(*), users(*), reservation_items(count)'); if (options?.resource_id) query = query.eq('resource_id', options.resource_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('start_time', options.from_date); if (options?.to_date) query = query.lte('end_time', options.to_date); if (options?.search) query = query.or(`title.ilike.%${options.search}%,confirmation_code.ilike.%${options.search}%`); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReservationByCode(confirmationCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservations').select('*, reservation_resources(*), users(*), reservation_items(*)').eq('confirmation_code', confirmationCode.toUpperCase()).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReservationResources(options?: { category?: string; is_available?: boolean; location?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('reservation_resources').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available); if (options?.location) query = query.eq('location', options.location); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAvailableSlots(resourceId: string, date: string, options?: { duration?: number }) {
  try { const supabase = await createClient(); const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0); const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999); const { data: reservations } = await supabase.from('reservations').select('start_time, end_time').eq('resource_id', resourceId).in('status', ['pending', 'confirmed', 'checked_in']).gte('start_time', startOfDay.toISOString()).lte('end_time', endOfDay.toISOString()).order('start_time', { ascending: true }); const { data: resource } = await supabase.from('reservation_resources').select('operating_hours, slot_duration').eq('id', resourceId).single(); const slots: { start: string; end: string; available: boolean }[] = []; const duration = options?.duration || resource?.slot_duration || 60; const operatingHours = resource?.operating_hours || { start: '09:00', end: '17:00' }; const [startHour, startMin] = operatingHours.start.split(':').map(Number); const [endHour, endMin] = operatingHours.end.split(':').map(Number); let current = new Date(startOfDay); current.setHours(startHour, startMin, 0, 0); const dayEnd = new Date(startOfDay); dayEnd.setHours(endHour, endMin, 0, 0); while (current < dayEnd) { const slotEnd = new Date(current.getTime() + duration * 60000); const isBooked = reservations?.some(r => { const rStart = new Date(r.start_time); const rEnd = new Date(r.end_time); return current < rEnd && slotEnd > rStart }); slots.push({ start: current.toISOString(), end: slotEnd.toISOString(), available: !isBooked }); current = slotEnd } return { success: true, data: slots } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReservationHistory(reservationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reservation_history').select('*, users(*)').eq('reservation_id', reservationId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReservationStats(options?: { resource_id?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('reservations').select('status, guests'); if (options?.resource_id) query = query.eq('resource_id', options.resource_id); if (options?.from_date) query = query.gte('start_time', options.from_date); if (options?.to_date) query = query.lte('end_time', options.to_date); const { data } = await query; const reservations = data || []; const total = reservations.length; const pending = reservations.filter(r => r.status === 'pending').length; const confirmed = reservations.filter(r => r.status === 'confirmed').length; const completed = reservations.filter(r => r.status === 'completed').length; const cancelled = reservations.filter(r => r.status === 'cancelled').length; const totalGuests = reservations.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (r.guests || 1), 0); return { success: true, data: { total, pending, confirmed, completed, cancelled, totalGuests } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
