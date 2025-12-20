'use server'

/**
 * Extended Redirect Server Actions - Covers all Redirect-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRedirect(redirectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('redirects').select('*').eq('id', redirectId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRedirectByPath(path: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('redirects').select('*').eq('source_path', path).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRedirect(redirectData: { source_path: string; destination_url: string; redirect_type?: number; is_permanent?: boolean; preserve_query?: boolean; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('redirects').insert({ ...redirectData, redirect_type: redirectData.redirect_type || (redirectData.is_permanent ? 301 : 302), is_active: true, hit_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRedirect(redirectId: string, updates: Partial<{ destination_url: string; redirect_type: number; is_active: boolean; preserve_query: boolean; expires_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('redirects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', redirectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRedirect(redirectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('redirects').delete().eq('id', redirectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordRedirectHit(redirectId: string, hitData?: { ip_address?: string; user_agent?: string; referrer?: string }) {
  try { const supabase = await createClient(); await supabase.from('redirects').update({ hit_count: supabase.rpc('increment_redirect_hits', { redirect_id: redirectId }), last_hit_at: new Date().toISOString() }).eq('id', redirectId); if (hitData) { await supabase.from('redirect_hits').insert({ redirect_id: redirectId, ...hitData, hit_at: new Date().toISOString() }); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRedirects(filters?: { user_id?: string; is_active?: boolean; redirect_type?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('redirects').select('*'); if (filters?.user_id) query = query.eq('user_id', filters.user_id); if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active); if (filters?.redirect_type) query = query.eq('redirect_type', filters.redirect_type); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkCreateRedirects(redirects: Array<{ source_path: string; destination_url: string; redirect_type?: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('redirects').insert(redirects.map(r => ({ ...r, redirect_type: r.redirect_type || 301, is_active: true, hit_count: 0, created_at: new Date().toISOString() }))).select(); if (error) throw error; return { success: true, data: data || [], count: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
