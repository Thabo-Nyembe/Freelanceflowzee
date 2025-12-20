'use server'

/**
 * Extended Event Server Actions - Covers all Event-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getEvents(status?: string, eventType?: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('events').select('*').order('start_date', { ascending: true }); if (status) query = query.eq('status', status); if (eventType) query = query.eq('event_type', eventType); if (startDate) query = query.gte('start_date', startDate); if (endDate) query = query.lte('end_date', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEvent(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEvent(input: { title: string; description?: string; event_type: string; start_date: string; end_date?: string; location?: string; virtual_link?: string; max_attendees?: number; registration_deadline?: string; is_public?: boolean; cover_image?: string; tags?: string[]; organizer_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').insert({ ...input, status: 'draft', attendee_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEvent(eventId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishEvent(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelEvent(eventId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').update({ status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeEvent(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEvent(eventId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('events').delete().eq('id', eventId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEventRegistrations(eventId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('event_registrations').select('*').eq('event_id', eventId).order('registered_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerForEvent(eventId: string, userId: string, additionalInfo?: any) {
  try { const supabase = await createClient(); const { data: event, error: eventError } = await supabase.from('events').select('max_attendees, attendee_count').eq('id', eventId).single(); if (eventError) throw eventError; if (event.max_attendees && event.attendee_count >= event.max_attendees) throw new Error('Event is full'); const { data, error } = await supabase.from('event_registrations').insert({ event_id: eventId, user_id: userId, status: 'registered', additional_info: additionalInfo, registered_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('events').update({ attendee_count: (event.attendee_count || 0) + 1 }).eq('id', eventId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelEventRegistration(registrationId: string) {
  try { const supabase = await createClient(); const { data: registration, error: regError } = await supabase.from('event_registrations').select('event_id').eq('id', registrationId).single(); if (regError) throw regError; const { data, error } = await supabase.from('event_registrations').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', registrationId).select().single(); if (error) throw error; const { data: event } = await supabase.from('events').select('attendee_count').eq('id', registration.event_id).single(); if (event) { await supabase.from('events').update({ attendee_count: Math.max(0, (event.attendee_count || 1) - 1) }).eq('id', registration.event_id); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkInAttendee(registrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_registrations').update({ status: 'attended', checked_in_at: new Date().toISOString() }).eq('id', registrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserEventRegistrations(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('event_registrations').select('*, events(*)').eq('user_id', userId).order('registered_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUpcomingEvents(limit = 10) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('events').select('*').eq('status', 'published').gte('start_date', now).order('start_date', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
