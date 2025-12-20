'use server'

/**
 * Extended Share Server Actions - Covers all Share-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getShares(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shares').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSharedWithUser(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shares').select('*').eq('shared_with_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createShare(ownerId: string, input: { resource_type: string; resource_id: string; shared_with_id?: string; shared_with_email?: string; permission: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shares').insert({ owner_id: ownerId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSharePermission(shareId: string, permission: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('shares').update({ permission }).eq('id', shareId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeShare(shareId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('shares').delete().eq('id', shareId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShareLinks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_links').select('*').eq('created_by', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createShareLink(userId: string, input: { resource_type: string; resource_id: string; permission: string; expires_at?: string; password?: string; max_uses?: number }) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('share_links').insert({ created_by: userId, token, ...input, use_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShareLinkByToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_links').select('*').eq('token', token).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementShareLinkUse(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_links').update({ use_count: supabase.rpc('increment_counter', { row_id: linkId }), last_used_at: new Date().toISOString() }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateShareLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_links').update({ is_active: false }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteShareLink(linkId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('share_links').delete().eq('id', linkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShareAnalytics(shareId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_analytics').select('*').eq('share_id', shareId).order('viewed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackShareView(shareId: string, viewerInfo: { viewer_id?: string; ip_address?: string; user_agent?: string; referrer?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_analytics').insert({ share_id: shareId, ...viewerInfo, viewed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShareStats(shareId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('share_analytics').select('id').eq('share_id', shareId); if (error) throw error; return { success: true, data: { total_views: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
