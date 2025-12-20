'use server'

/**
 * Extended Links Server Actions
 * Tables: links, link_clicks, link_analytics, link_tags, short_links, link_groups
 */

import { createClient } from '@/lib/supabase/server'

export async function getLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').select('*, link_tags(*), link_analytics(*)').eq('id', linkId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLink(linkData: { url: string; title?: string; description?: string; user_id: string; group_id?: string; is_public?: boolean; expires_at?: string }) {
  try { const supabase = await createClient(); const shortCode = Math.random().toString(36).substr(2, 8); const { data, error } = await supabase.from('links').insert({ ...linkData, short_code: shortCode, click_count: 0, is_active: true, is_public: linkData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLink(linkId: string, updates: Partial<{ url: string; title: string; description: string; is_active: boolean; is_public: boolean; expires_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLink(linkId: string) {
  try { const supabase = await createClient(); await supabase.from('link_clicks').delete().eq('link_id', linkId); await supabase.from('link_tags').delete().eq('link_id', linkId); const { error } = await supabase.from('links').delete().eq('id', linkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLinks(userId: string, options?: { group_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('links').select('*, link_tags(*)').eq('user_id', userId); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`title.ilike.%${options.search}%,url.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLinkByShortCode(shortCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('links').select('*').eq('short_code', shortCode).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Link not found' }; if (!data.is_active) return { success: false, error: 'Link is inactive' }; if (data.expires_at && new Date(data.expires_at) < new Date()) return { success: false, error: 'Link has expired' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordClick(linkId: string, clickData?: { ip_address?: string; user_agent?: string; referrer?: string; country?: string; device?: string }) {
  try { const supabase = await createClient(); await supabase.from('link_clicks').insert({ link_id: linkId, ...clickData, clicked_at: new Date().toISOString() }); const { data: link } = await supabase.from('links').select('click_count').eq('id', linkId).single(); const { data, error } = await supabase.from('links').update({ click_count: (link?.click_count || 0) + 1, last_clicked_at: new Date().toISOString() }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLinkClicks(linkId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('link_clicks').select('*').eq('link_id', linkId); if (options?.from_date) query = query.gte('clicked_at', options.from_date); if (options?.to_date) query = query.lte('clicked_at', options.to_date); const { data, error } = await query.order('clicked_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLinkAnalytics(linkId: string) {
  try { const supabase = await createClient(); const { data: clicks } = await supabase.from('link_clicks').select('country, device, referrer, clicked_at').eq('link_id', linkId); const analytics = { totalClicks: clicks?.length || 0, byCountry: {} as Record<string, number>, byDevice: {} as Record<string, number>, byReferrer: {} as Record<string, number>, clicksByDay: {} as Record<string, number> }; clicks?.forEach(click => { if (click.country) analytics.byCountry[click.country] = (analytics.byCountry[click.country] || 0) + 1; if (click.device) analytics.byDevice[click.device] = (analytics.byDevice[click.device] || 0) + 1; if (click.referrer) analytics.byReferrer[click.referrer] = (analytics.byReferrer[click.referrer] || 0) + 1; const day = new Date(click.clicked_at).toISOString().split('T')[0]; analytics.clicksByDay[day] = (analytics.clicksByDay[day] || 0) + 1 }); return { success: true, data: analytics } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLinkGroup(groupData: { name: string; description?: string; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('link_groups').insert({ ...groupData, link_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLinkGroups(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('link_groups').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLinkTag(linkId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('link_tags').insert({ link_id: linkId, tag, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShortLink(linkData: { url: string; custom_code?: string; user_id?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const code = linkData.custom_code || Math.random().toString(36).substr(2, 6); const { data: existing } = await supabase.from('short_links').select('id').eq('code', code).single(); if (existing) return { success: false, error: 'Short code already exists' }; const { data, error } = await supabase.from('short_links').insert({ original_url: linkData.url, code, user_id: linkData.user_id, expires_at: linkData.expires_at, click_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
