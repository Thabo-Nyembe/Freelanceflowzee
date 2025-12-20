'use server'

/**
 * Extended Rooms Server Actions
 * Tables: rooms, room_bookings, room_amenities, room_types, room_rates, room_availability
 */

import { createClient } from '@/lib/supabase/server'

export async function getRoom(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rooms').select('*, room_types(*), room_amenities(*), room_rates(*), room_availability(*)').eq('id', roomId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRoom(roomData: { name: string; type_id: string; description?: string; capacity?: number; floor?: number; building?: string; location_id?: string; amenities?: string[]; hourly_rate?: number; daily_rate?: number; is_available?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { amenities, ...roomInfo } = roomData; const { data: room, error: roomError } = await supabase.from('rooms').insert({ ...roomInfo, is_available: roomInfo.is_available ?? true, created_at: new Date().toISOString() }).select().single(); if (roomError) throw roomError; if (amenities && amenities.length > 0) { const amenityData = amenities.map(a => ({ room_id: room.id, amenity_id: a, created_at: new Date().toISOString() })); await supabase.from('room_amenities').insert(amenityData) } return { success: true, data: room } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRoom(roomId: string, updates: Partial<{ name: string; description: string; capacity: number; floor: number; hourly_rate: number; daily_rate: number; is_available: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rooms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roomId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRoom(roomId: string) {
  try { const supabase = await createClient(); await supabase.from('room_amenities').delete().eq('room_id', roomId); await supabase.from('room_availability').delete().eq('room_id', roomId); const { error } = await supabase.from('rooms').delete().eq('id', roomId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRooms(options?: { type_id?: string; location_id?: string; building?: string; floor?: number; min_capacity?: number; is_available?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rooms').select('*, room_types(*), room_amenities(count), room_bookings(count)'); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.location_id) query = query.eq('location_id', options.location_id); if (options?.building) query = query.eq('building', options.building); if (options?.floor) query = query.eq('floor', options.floor); if (options?.min_capacity) query = query.gte('capacity', options.min_capacity); if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bookRoom(bookingData: { room_id: string; booked_by: string; title: string; description?: string; start_time: string; end_time: string; attendees_count?: number; attendees?: string[]; is_recurring?: boolean; recurrence_rule?: string }) {
  try { const supabase = await createClient(); const { data: conflicts } = await supabase.from('room_bookings').select('id').eq('room_id', bookingData.room_id).neq('status', 'cancelled').or(`and(start_time.lt.${bookingData.end_time},end_time.gt.${bookingData.start_time})`); if (conflicts && conflicts.length > 0) return { success: false, error: 'Room is not available during this time' }; const { data, error } = await supabase.from('room_bookings').insert({ ...bookingData, status: 'confirmed', confirmation_code: `RB-${Date.now()}`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelBooking(bookingId: string, cancelledBy: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('room_bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: cancelledBy, cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoomBookings(roomId: string, options?: { from_date?: string; to_date?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('room_bookings').select('*, users(*)').eq('room_id', roomId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('start_time', options.from_date); if (options?.to_date) query = query.lte('end_time', options.to_date); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserBookings(userId: string, options?: { status?: string; upcoming_only?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('room_bookings').select('*, rooms(*, room_types(*))').eq('booked_by', userId); if (options?.status) query = query.eq('status', options.status); if (options?.upcoming_only) query = query.gte('start_time', new Date().toISOString()); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkRoomAvailability(roomId: string, startTime: string, endTime: string) {
  try { const supabase = await createClient(); const { data: conflicts, error } = await supabase.from('room_bookings').select('id, title, start_time, end_time').eq('room_id', roomId).neq('status', 'cancelled').or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`); if (error) throw error; return { success: true, data: { available: !conflicts || conflicts.length === 0, conflicts: conflicts || [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAvailableRooms(startTime: string, endTime: string, options?: { type_id?: string; min_capacity?: number; location_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('rooms').select('*, room_types(*)').eq('is_available', true); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.min_capacity) query = query.gte('capacity', options.min_capacity); if (options?.location_id) query = query.eq('location_id', options.location_id); const { data: rooms } = await query.order('name', { ascending: true }); if (!rooms) return { success: true, data: [] }; const { data: bookings } = await supabase.from('room_bookings').select('room_id').neq('status', 'cancelled').or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`); const bookedRoomIds = new Set(bookings?.map(b => b.room_id) || []); const availableRooms = rooms.filter(r => !bookedRoomIds.has(r.id)); return { success: true, data: availableRooms } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRoomTypes(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('room_types').select('*, rooms(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setRoomAvailability(roomId: string, availability: { date: string; is_available: boolean; start_time?: string; end_time?: string; reason?: string }[]) {
  try { const supabase = await createClient(); const dates = availability.map(a => a.date); await supabase.from('room_availability').delete().eq('room_id', roomId).in('date', dates); const availData = availability.map(a => ({ room_id: roomId, ...a, created_at: new Date().toISOString() })); const { error } = await supabase.from('room_availability').insert(availData); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoomRates(roomId: string, options?: { effective_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('room_rates').select('*').eq('room_id', roomId); if (options?.effective_date) { query = query.lte('effective_from', options.effective_date).or(`effective_until.is.null,effective_until.gte.${options.effective_date}`) } const { data, error } = await query.order('effective_from', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

