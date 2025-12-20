'use server'

/**
 * Extended Slots Server Actions
 * Tables: slots, slot_bookings, slot_availability, slot_templates, slot_rules, slot_blocks
 */

import { createClient } from '@/lib/supabase/server'

export async function getSlot(slotId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('slots').select('*, slot_bookings(*), slot_templates(*), slot_rules(*)').eq('id', slotId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSlot(slotData: { entity_type: string; entity_id: string; start_time: string; end_time: string; capacity?: number; price?: number; template_id?: string; is_available?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('slots').insert({ ...slotData, is_available: slotData.is_available ?? true, booked_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSlot(slotId: string, updates: Partial<{ start_time: string; end_time: string; capacity: number; price: number; is_available: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('slots').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', slotId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSlot(slotId: string) {
  try { const supabase = await createClient(); const { data: slot } = await supabase.from('slots').select('booked_count').eq('id', slotId).single(); if (slot && slot.booked_count > 0) return { success: false, error: 'Cannot delete slot with bookings' }; const { error } = await supabase.from('slots').delete().eq('id', slotId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSlots(options?: { entity_type?: string; entity_id?: string; from_date?: string; to_date?: string; is_available?: boolean; has_capacity?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('slots').select('*, slot_bookings(count)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.from_date) query = query.gte('start_time', options.from_date); if (options?.to_date) query = query.lte('end_time', options.to_date); if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available); if (options?.has_capacity) query = query.or('capacity.is.null,booked_count.lt.capacity'); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bookSlot(slotId: string, bookingData: { user_id: string; quantity?: number; notes?: string; metadata?: any }) {
  try { const supabase = await createClient(); const quantity = bookingData.quantity || 1; const { data: slot } = await supabase.from('slots').select('capacity, booked_count, is_available, price').eq('id', slotId).single(); if (!slot) return { success: false, error: 'Slot not found' }; if (!slot.is_available) return { success: false, error: 'Slot not available' }; if (slot.capacity !== null && slot.booked_count + quantity > slot.capacity) return { success: false, error: 'Not enough capacity' }; const { data: booking, error: bookingError } = await supabase.from('slot_bookings').insert({ slot_id: slotId, user_id: bookingData.user_id, quantity, price: slot.price ? slot.price * quantity : null, status: 'confirmed', confirmation_code: `SLB-${Date.now()}`, notes: bookingData.notes, metadata: bookingData.metadata, booked_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (bookingError) throw bookingError; await supabase.from('slots').update({ booked_count: slot.booked_count + quantity, is_available: slot.capacity === null || (slot.booked_count + quantity) < slot.capacity, updated_at: new Date().toISOString() }).eq('id', slotId); return { success: true, data: booking } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelSlotBooking(bookingId: string, cancelledBy: string, reason?: string) {
  try { const supabase = await createClient(); const { data: booking } = await supabase.from('slot_bookings').select('slot_id, quantity').eq('id', bookingId).single(); if (!booking) return { success: false, error: 'Booking not found' }; const { data, error } = await supabase.from('slot_bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: cancelledBy, cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; const { data: slot } = await supabase.from('slots').select('booked_count').eq('id', booking.slot_id).single(); if (slot) { await supabase.from('slots').update({ booked_count: Math.max(0, slot.booked_count - booking.quantity), is_available: true, updated_at: new Date().toISOString() }).eq('id', booking.slot_id) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSlotBookings(slotId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('slot_bookings').select('*, users(*)').eq('slot_id', slotId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('booked_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserSlotBookings(userId: string, options?: { status?: string; from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('slot_bookings').select('*, slots(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('slots.start_time', options.from_date); const { data, error } = await query.order('booked_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function generateSlotsFromTemplate(templateId: string, startDate: string, endDate: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data: template } = await supabase.from('slot_templates').select('*').eq('id', templateId).single(); if (!template) return { success: false, error: 'Template not found' }; const slots: any[] = []; const start = new Date(startDate); const end = new Date(endDate); for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) { if (template.days_of_week && !template.days_of_week.includes(d.getDay())) continue; const slotTimes = template.time_slots || []; for (const time of slotTimes) { slots.push({ entity_type: entityType, entity_id: entityId, start_time: `${d.toISOString().split('T')[0]}T${time.start}`, end_time: `${d.toISOString().split('T')[0]}T${time.end}`, capacity: template.default_capacity, price: template.default_price, template_id: templateId, is_available: true, booked_count: 0, created_at: new Date().toISOString() }) } } if (slots.length > 0) { await supabase.from('slots').insert(slots) } return { success: true, data: { generatedCount: slots.length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function blockSlots(entityType: string, entityId: string, startTime: string, endTime: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('slot_blocks').insert({ entity_type: entityType, entity_id: entityId, start_time: startTime, end_time: endTime, reason, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('slots').update({ is_available: false, updated_at: new Date().toISOString() }).eq('entity_type', entityType).eq('entity_id', entityId).gte('start_time', startTime).lte('end_time', endTime); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSlotTemplates(options?: { entity_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('slot_templates').select('*'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

