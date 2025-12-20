'use server'

/**
 * Extended Link Server Actions - Covers all Link-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').select('*').eq('id', linkId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLinkBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLink(linkData: { url: string; slug?: string; title?: string; description?: string; expires_at?: string; password?: string; user_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const slug = linkData.slug || generateSlug(); const { data, error } = await supabase.from('links').insert({ ...linkData, slug, click_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateSlug(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export async function updateLink(linkId: string, updates: Partial<{ url: string; title: string; description: string; expires_at: string; is_active: boolean; password: string; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLink(linkId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('links').delete().eq('id', linkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordLinkClick(linkId: string, clickData?: { ip_address?: string; user_agent?: string; referrer?: string; country?: string }) {
  try { const supabase = await createClient(); await supabase.from('links').update({ click_count: supabase.rpc('increment_click_count', { link_id: linkId }) }).eq('id', linkId); if (clickData) { await supabase.from('link_clicks').insert({ link_id: linkId, ...clickData, clicked_at: new Date().toISOString() }); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLinks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLinkAnalytics(linkId: string, since?: string) {
  try { const supabase = await createClient(); let query = supabase.from('link_clicks').select('*').eq('link_id', linkId); if (since) query = query.gte('clicked_at', since); const { data, error } = await query.order('clicked_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [], total: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkLinkPassword(linkId: string, password: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('links').select('password').eq('id', linkId).single(); if (!data) return { success: false, error: 'Link not found' }; if (!data.password) return { success: true, valid: true }; return { success: true, valid: data.password === password } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', valid: false } }
}
