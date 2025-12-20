'use server'

/**
 * Extended Invite Server Actions - Covers all Invite-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvites(userId: string, type?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('invites').select('*').or(`sender_id.eq.${userId},recipient_email.eq.${userId}`).order('created_at', { ascending: false }); if (type) query = query.eq('invite_type', type); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvite(senderId: string, recipientEmail: string, inviteType: string, resourceId?: string, message?: string, expiresIn = 7) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString(); const { data, error } = await supabase.from('invites').insert({ sender_id: senderId, recipient_email: recipientEmail, invite_type: inviteType, resource_id: resourceId, message, token, status: 'pending', expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptInvite(token: string, userId: string) {
  try { const supabase = await createClient(); const { data: invite } = await supabase.from('invites').select('*').eq('token', token).eq('status', 'pending').single(); if (!invite) return { success: false, error: 'Invite not found or already used' }; if (new Date(invite.expires_at) < new Date()) { await supabase.from('invites').update({ status: 'expired' }).eq('id', invite.id); return { success: false, error: 'Invite has expired' }; } const { data, error } = await supabase.from('invites').update({ status: 'accepted', accepted_by: userId, accepted_at: new Date().toISOString() }).eq('id', invite.id).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function declineInvite(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invites').update({ status: 'declined', declined_at: new Date().toISOString() }).eq('token', token).eq('status', 'pending').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeInvite(inviteId: string, senderId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('invites').update({ status: 'revoked' }).eq('id', inviteId).eq('sender_id', senderId).eq('status', 'pending'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resendInvite(inviteId: string, senderId: string) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); const { data, error } = await supabase.from('invites').update({ token, expires_at: expiresAt, resent_at: new Date().toISOString() }).eq('id', inviteId).eq('sender_id', senderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInviteByToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invites').select('*').eq('token', token).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingInviteCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('invites').select('*', { count: 'exact', head: true }).eq('recipient_email', userId).eq('status', 'pending'); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}
