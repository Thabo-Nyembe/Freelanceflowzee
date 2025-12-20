'use server'

/**
 * Extended Invites Server Actions
 * Tables: invites, invite_codes, invite_links, invite_campaigns, invite_rewards, invite_tracking
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvite(inviteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invites').select('*').eq('id', inviteId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvite(inviteData: { inviter_id: string; email?: string; phone?: string; type: string; target_id?: string; target_type?: string; message?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const code = Math.random().toString(36).substring(2, 10).toUpperCase(); const { data, error } = await supabase.from('invites').insert({ ...inviteData, code, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvite(inviteId: string, updates: Partial<{ status: string; accepted_at: string; accepted_by: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invites').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', inviteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvites(options?: { inviter_id?: string; status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('invites').select('*'); if (options?.inviter_id) query = query.eq('inviter_id', options.inviter_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function acceptInvite(code: string, userId: string) {
  try { const supabase = await createClient(); const { data: invite, error: fetchError } = await supabase.from('invites').select('*').eq('code', code).eq('status', 'pending').single(); if (fetchError || !invite) throw new Error('Invalid or expired invite'); if (invite.expires_at && new Date(invite.expires_at) < new Date()) throw new Error('Invite has expired'); const { data, error } = await supabase.from('invites').update({ status: 'accepted', accepted_at: new Date().toISOString(), accepted_by: userId }).eq('id', invite.id).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInviteCode(codeData: { code: string; created_by: string; max_uses?: number; expires_at?: string; reward_id?: string; campaign_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invite_codes').insert({ ...codeData, use_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInviteCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invite_codes').select('*').eq('code', code).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function useInviteCode(code: string, userId: string) {
  try { const supabase = await createClient(); const { data: inviteCode, error: fetchError } = await supabase.from('invite_codes').select('*').eq('code', code).eq('is_active', true).single(); if (fetchError || !inviteCode) throw new Error('Invalid invite code'); if (inviteCode.max_uses && inviteCode.use_count >= inviteCode.max_uses) throw new Error('Invite code has reached maximum uses'); if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) throw new Error('Invite code has expired'); const { error } = await supabase.from('invite_codes').update({ use_count: inviteCode.use_count + 1 }).eq('id', inviteCode.id); if (error) throw error; await supabase.from('invite_tracking').insert({ code_id: inviteCode.id, user_id: userId, used_at: new Date().toISOString() }); return { success: true, data: inviteCode } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInviteLink(linkData: { created_by: string; target_type: string; target_id?: string; expires_at?: string; max_uses?: number }) {
  try { const supabase = await createClient(); const token = Math.random().toString(36).substring(2) + Date.now().toString(36); const { data, error } = await supabase.from('invite_links').insert({ ...linkData, token, use_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInviteLink(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invite_links').select('*').eq('token', token).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInviteCampaign(campaignData: { name: string; description?: string; start_date: string; end_date?: string; reward_id?: string; max_invites?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invite_campaigns').insert({ ...campaignData, invite_count: 0, conversion_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInviteCampaigns(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('invite_campaigns').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInviteRewards(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('invite_rewards').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserInviteStats(userId: string) {
  try { const supabase = await createClient(); const { data: invites } = await supabase.from('invites').select('id, status').eq('inviter_id', userId); const total = invites?.length || 0; const accepted = invites?.filter(i => i.status === 'accepted').length || 0; const pending = invites?.filter(i => i.status === 'pending').length || 0; return { success: true, data: { total, accepted, pending, conversion_rate: total > 0 ? (accepted / total) * 100 : 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
