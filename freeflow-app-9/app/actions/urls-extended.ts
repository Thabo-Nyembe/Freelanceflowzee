'use server'

/**
 * Extended URLs Server Actions
 * Tables: urls, url_clicks, url_analytics, url_groups, url_redirects, url_qr_codes
 */

import { createClient } from '@/lib/supabase/server'

export async function getUrl(urlId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('urls').select('*, url_groups(*), users(*)').eq('id', urlId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUrl(urlData: { original_url: string; short_code?: string; title?: string; description?: string; group_id?: string; is_active?: boolean; expires_at?: string; password?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; created_by: string; metadata?: any }) {
  try { const supabase = await createClient(); const shortCode = urlData.short_code || generateShortCode(); const { data, error } = await supabase.from('urls').insert({ ...urlData, short_code: shortCode, is_active: urlData.is_active ?? true, click_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateShortCode(length: number = 7): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function updateUrl(urlId: string, updates: Partial<{ original_url: string; short_code: string; title: string; description: string; group_id: string; is_active: boolean; expires_at: string; password: string; utm_source: string; utm_medium: string; utm_campaign: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('urls').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', urlId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUrl(urlId: string) {
  try { const supabase = await createClient(); await supabase.from('url_clicks').delete().eq('url_id', urlId); await supabase.from('url_analytics').delete().eq('url_id', urlId); await supabase.from('url_redirects').delete().eq('url_id', urlId); await supabase.from('url_qr_codes').delete().eq('url_id', urlId); const { error } = await supabase.from('urls').delete().eq('id', urlId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUrls(options?: { created_by?: string; group_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('urls').select('*, url_groups(*), users(*)'); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`title.ilike.%${options.search}%,original_url.ilike.%${options.search}%,short_code.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUrlByShortCode(shortCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('urls').select('*').eq('short_code', shortCode).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordClick(urlId: string, clickData: { ip_address?: string; user_agent?: string; referer?: string; country?: string; city?: string; device_type?: string; browser?: string; os?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('url_clicks').insert({ url_id: urlId, ...clickData, clicked_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('urls').update({ click_count: supabase.rpc('increment_count', { row_id: urlId, count_column: 'click_count' }), last_clicked_at: new Date().toISOString() }).eq('id', urlId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClicks(urlId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('url_clicks').select('*').eq('url_id', urlId); if (options?.from_date) query = query.gte('clicked_at', options.from_date); if (options?.to_date) query = query.lte('clicked_at', options.to_date); const { data, error } = await query.order('clicked_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalytics(urlId: string, options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('url_clicks').select('country, city, device_type, browser, os, referer').eq('url_id', urlId); if (options?.from_date) query = query.gte('clicked_at', options.from_date); if (options?.to_date) query = query.lte('clicked_at', options.to_date); const { data, error } = await query; if (error) throw error; const clicks = data || []; const byCountry: Record<string, number> = {}; const byDevice: Record<string, number> = {}; const byBrowser: Record<string, number> = {}; const byReferer: Record<string, number> = {}; clicks.forEach(c => { if (c.country) byCountry[c.country] = (byCountry[c.country] || 0) + 1; if (c.device_type) byDevice[c.device_type] = (byDevice[c.device_type] || 0) + 1; if (c.browser) byBrowser[c.browser] = (byBrowser[c.browser] || 0) + 1; if (c.referer) byReferer[c.referer] = (byReferer[c.referer] || 0) + 1 }); return { success: true, data: { total_clicks: clicks.length, by_country: byCountry, by_device: byDevice, by_browser: byBrowser, by_referer: byReferer } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGroup(groupData: { name: string; description?: string; created_by: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('url_groups').insert({ ...groupData, is_public: groupData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroups(options?: { created_by?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('url_groups').select('*, urls(count)'); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRedirect(urlId: string, redirectData: { condition_type: string; condition_value: string; target_url: string; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('url_redirects').insert({ url_id: urlId, ...redirectData, priority: redirectData.priority || 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRedirects(urlId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('url_redirects').select('*').eq('url_id', urlId).order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function generateQrCode(urlId: string, qrData: { format?: string; size?: number; foreground_color?: string; background_color?: string; include_logo?: boolean; logo_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('url_qr_codes').insert({ url_id: urlId, ...qrData, format: qrData.format || 'png', size: qrData.size || 256, foreground_color: qrData.foreground_color || '#000000', background_color: qrData.background_color || '#ffffff', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQrCodes(urlId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('url_qr_codes').select('*').eq('url_id', urlId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resolveUrl(shortCode: string, context?: { ip_address?: string; user_agent?: string; referer?: string }): Promise<{ success: boolean; data?: string; error?: string }> {
  try { const supabase = await createClient(); const { data: url } = await supabase.from('urls').select('*').eq('short_code', shortCode).single(); if (!url) return { success: false, error: 'URL not found' }; if (!url.is_active) return { success: false, error: 'URL is not active' }; if (url.expires_at && new Date(url.expires_at) < new Date()) return { success: false, error: 'URL has expired' }; if (context) { const { data: redirects } = await supabase.from('url_redirects').select('*').eq('url_id', url.id).eq('is_active', true).order('priority', { ascending: false }); for (const redirect of redirects || []) { if (matchesCondition(redirect, context)) { return { success: true, data: redirect.target_url } } } } let targetUrl = url.original_url; if (url.utm_source || url.utm_medium || url.utm_campaign) { const urlObj = new URL(targetUrl); if (url.utm_source) urlObj.searchParams.set('utm_source', url.utm_source); if (url.utm_medium) urlObj.searchParams.set('utm_medium', url.utm_medium); if (url.utm_campaign) urlObj.searchParams.set('utm_campaign', url.utm_campaign); targetUrl = urlObj.toString() } await recordClick(url.id, context || {}); return { success: true, data: targetUrl } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function matchesCondition(redirect: any, context: any): boolean {
  switch (redirect.condition_type) {
    case 'country': return context.country === redirect.condition_value
    case 'device': return context.device_type === redirect.condition_value
    case 'browser': return context.browser?.includes(redirect.condition_value)
    case 'referer': return context.referer?.includes(redirect.condition_value)
    default: return false
  }
}
