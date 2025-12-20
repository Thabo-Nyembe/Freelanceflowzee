'use server'

/**
 * Extended Guest Server Actions - Covers all Guest-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getGuests(hostId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guests').select('*').eq('host_id', hostId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGuest(guestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guests').select('*').eq('id', guestId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function inviteGuest(hostId: string, input: { email: string; name?: string; role?: string; expires_at?: string; message?: string }) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('guests').insert({ host_id: hostId, ...input, invitation_token: token, status: 'invited' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptGuestInvitation(token: string, guestUserId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guests').update({ status: 'active', guest_user_id: guestUserId, accepted_at: new Date().toISOString() }).eq('invitation_token', token).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGuest(guestId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guests').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', guestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeGuestAccess(guestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guests').update({ status: 'revoked', revoked_at: new Date().toISOString() }).eq('id', guestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteGuest(guestId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('guests').delete().eq('id', guestId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGuestAccess(guestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guest_access').select('*').eq('guest_id', guestId).order('granted_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function grantGuestAccess(guestId: string, input: { resource_type: string; resource_id: string; permission: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guest_access').insert({ guest_id: guestId, ...input, granted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGuestAccessPermission(accessId: string, permission: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guest_access').update({ permission, updated_at: new Date().toISOString() }).eq('id', accessId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeGuestResourceAccess(accessId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('guest_access').delete().eq('id', accessId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGuestByToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('guests').select('*').eq('invitation_token', token).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resendGuestInvitation(guestId: string) {
  try { const supabase = await createClient(); const newToken = crypto.randomUUID(); const { data, error } = await supabase.from('guests').update({ invitation_token: newToken, invitation_sent_at: new Date().toISOString() }).eq('id', guestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
