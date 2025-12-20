'use server'

/**
 * Extended Short URL Server Actions - Covers all Short URL-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getShortUrl(shortUrlId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('short_urls').select('*').eq('id', shortUrlId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShortUrlByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('short_urls').select('*').eq('code', code).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShortUrl(urlData: { original_url: string; code?: string; title?: string; expires_at?: string; max_clicks?: number; password?: string; user_id?: string; campaign_id?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }) {
  try { const supabase = await createClient(); const code = urlData.code || generateCode(); const { data, error } = await supabase.from('short_urls').insert({ ...urlData, code, click_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data, shortUrl: `${process.env.NEXT_PUBLIC_SHORT_URL_DOMAIN || ''}/${code}` } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export async function updateShortUrl(shortUrlId: string, updates: Partial<{ original_url: string; title: string; is_active: boolean; expires_at: string; max_clicks: number; password: string; utm_source: string; utm_medium: string; utm_campaign: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('short_urls').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', shortUrlId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteShortUrl(shortUrlId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('short_urls').delete().eq('id', shortUrlId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackShortUrlClick(code: string, clickData?: { ip_address?: string; user_agent?: string; referrer?: string; country?: string; city?: string; device?: string; browser?: string; os?: string }) {
  try { const supabase = await createClient(); const { data: shortUrl } = await supabase.from('short_urls').select('id, original_url, max_clicks, click_count, expires_at, is_active, password').eq('code', code).single(); if (!shortUrl) return { success: false, error: 'Short URL not found' }; if (!shortUrl.is_active) return { success: false, error: 'Short URL is inactive' }; if (shortUrl.expires_at && new Date(shortUrl.expires_at) < new Date()) return { success: false, error: 'Short URL has expired' }; if (shortUrl.max_clicks && shortUrl.click_count >= shortUrl.max_clicks) return { success: false, error: 'Click limit reached' }; await supabase.from('short_urls').update({ click_count: shortUrl.click_count + 1, last_clicked_at: new Date().toISOString() }).eq('id', shortUrl.id); if (clickData) { await supabase.from('short_url_clicks').insert({ short_url_id: shortUrl.id, ...clickData, clicked_at: new Date().toISOString() }); } return { success: true, originalUrl: shortUrl.original_url, requiresPassword: !!shortUrl.password } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserShortUrls(userId: string, options?: { includeInactive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('short_urls').select('*').eq('user_id', userId); if (!options?.includeInactive) query = query.eq('is_active', true); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getShortUrlAnalytics(shortUrlId: string, options?: { since?: string; groupBy?: 'day' | 'country' | 'device' | 'browser' }) {
  try { const supabase = await createClient(); let query = supabase.from('short_url_clicks').select('*').eq('short_url_id', shortUrlId); if (options?.since) query = query.gte('clicked_at', options.since); const { data, error } = await query.order('clicked_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [], total: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function verifyShortUrlPassword(code: string, password: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('short_urls').select('password, original_url').eq('code', code).single(); if (!data) return { success: false, error: 'Short URL not found' }; if (!data.password) return { success: true, valid: true, originalUrl: data.original_url }; return { success: true, valid: data.password === password, originalUrl: data.password === password ? data.original_url : null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', valid: false } }
}
