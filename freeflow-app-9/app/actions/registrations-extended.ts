'use server'

/**
 * Extended Registrations Server Actions
 * Tables: registrations, registration_fields, registration_responses, registration_confirmations, registration_waitlists
 */

import { createClient } from '@/lib/supabase/server'

export async function getRegistration(registrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registrations').select('*, registration_responses(*), users(*), events(*)').eq('id', registrationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRegistration(registrationData: { event_id?: string; entity_type?: string; entity_id?: string; user_id?: string; email: string; first_name?: string; last_name?: string; phone?: string; responses?: { field_id: string; value: any }[]; metadata?: any }) {
  try { const supabase = await createClient(); const { responses, ...regInfo } = registrationData; const confirmationCode = generateConfirmationCode(); const { data: registration, error: regError } = await supabase.from('registrations').insert({ ...regInfo, confirmation_code: confirmationCode, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (regError) throw regError; if (responses && responses.length > 0) { const responsesData = responses.map(r => ({ registration_id: registration.id, field_id: r.field_id, value: r.value, created_at: new Date().toISOString() })); await supabase.from('registration_responses').insert(responsesData) } return { success: true, data: registration } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) { code += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return code
}

export async function confirmRegistration(registrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registrations').update({ status: 'confirmed', confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', registrationId).select().single(); if (error) throw error; await supabase.from('registration_confirmations').insert({ registration_id: registrationId, type: 'email', sent_at: new Date().toISOString(), created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRegistration(registrationId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registrations').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', registrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkInRegistration(registrationId: string, checkInBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registrations').update({ status: 'checked_in', checked_in_at: new Date().toISOString(), checked_in_by: checkInBy, updated_at: new Date().toISOString() }).eq('id', registrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegistrations(options?: { event_id?: string; entity_type?: string; entity_id?: string; user_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('registrations').select('*, registration_responses(count), users(*)'); if (options?.event_id) query = query.eq('event_id', options.event_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.or(`email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,confirmation_code.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRegistrationByCode(confirmationCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registrations').select('*, registration_responses(*), users(*), events(*)').eq('confirmation_code', confirmationCode.toUpperCase()).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegistrationFields(entityType: string, entityId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('registration_fields').select('*').eq('entity_type', entityType); if (entityId) query = query.eq('entity_id', entityId); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRegistrationField(fieldData: { entity_type: string; entity_id?: string; name: string; label: string; type: string; required?: boolean; options?: any; validation?: any; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registration_fields').insert({ ...fieldData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegistrationResponses(registrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('registration_responses').select('*, registration_fields(*)').eq('registration_id', registrationId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addToWaitlist(waitlistData: { event_id?: string; entity_type?: string; entity_id?: string; email: string; first_name?: string; last_name?: string; phone?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('registration_waitlists').select('id').eq('entity_type', waitlistData.entity_type || 'event').eq('entity_id', waitlistData.entity_id || waitlistData.event_id).eq('email', waitlistData.email).single(); if (existing) return { success: false, error: 'Already on waitlist' }; const { data, error } = await supabase.from('registration_waitlists').insert({ ...waitlistData, status: 'waiting', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWaitlist(options?: { event_id?: string; entity_type?: string; entity_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('registration_waitlists').select('*'); if (options?.event_id) query = query.eq('event_id', options.event_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function promoteFromWaitlist(waitlistId: string) {
  try { const supabase = await createClient(); const { data: waitlistEntry, error: fetchError } = await supabase.from('registration_waitlists').select('*').eq('id', waitlistId).single(); if (fetchError) throw fetchError; const registrationResult = await createRegistration({ event_id: waitlistEntry.event_id, entity_type: waitlistEntry.entity_type, entity_id: waitlistEntry.entity_id, email: waitlistEntry.email, first_name: waitlistEntry.first_name, last_name: waitlistEntry.last_name, phone: waitlistEntry.phone }); if (!registrationResult.success) throw new Error(registrationResult.error); await supabase.from('registration_waitlists').update({ status: 'promoted', promoted_at: new Date().toISOString() }).eq('id', waitlistId); return { success: true, data: registrationResult.data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegistrationStats(options?: { event_id?: string; entity_type?: string; entity_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('registrations').select('status'); if (options?.event_id) query = query.eq('event_id', options.event_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); const { data } = await query; const registrations = data || []; const total = registrations.length; const pending = registrations.filter(r => r.status === 'pending').length; const confirmed = registrations.filter(r => r.status === 'confirmed').length; const checkedIn = registrations.filter(r => r.status === 'checked_in').length; const cancelled = registrations.filter(r => r.status === 'cancelled').length; const checkInRate = confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0; return { success: true, data: { total, pending, confirmed, checkedIn, cancelled, checkInRate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
