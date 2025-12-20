'use server'

/**
 * Extended Blocked Server Actions
 * Tables: blocked_users, blocked_ips, blocked_domains
 */

import { createClient } from '@/lib/supabase/server'

export async function getBlockedUser(blockId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocked_users').select('*').eq('id', blockId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function blockUser(blockData: { blocker_id: string; blocked_id: string; reason?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('blocked_users').select('id').eq('blocker_id', blockData.blocker_id).eq('blocked_id', blockData.blocked_id).single(); if (existing) return { success: false, error: 'Already blocked' }; const { data, error } = await supabase.from('blocked_users').insert({ ...blockData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unblockUser(blockerId: string, blockedId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('blocked_users').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBlockedUsers(blockerId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocked_users').select('*').eq('blocker_id', blockerId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function isUserBlocked(blockerId: string, blockedId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocked_users').select('id').eq('blocker_id', blockerId).eq('blocked_id', blockedId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, isBlocked: !!data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', isBlocked: false } }
}

export async function blockIP(blockData: { ip_address: string; reason?: string; blocked_by?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocked_ips').insert({ ...blockData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unblockIP(ipAddress: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('blocked_ips').update({ is_active: false, unblocked_at: new Date().toISOString() }).eq('ip_address', ipAddress); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBlockedIPs(options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('blocked_ips').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function isIPBlocked(ipAddress: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('blocked_ips').select('id').eq('ip_address', ipAddress).eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, isBlocked: !!data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', isBlocked: false } }
}

export async function blockDomain(blockData: { domain: string; reason?: string; blocked_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocked_domains').insert({ ...blockData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBlockedDomains(options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('blocked_domains').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
