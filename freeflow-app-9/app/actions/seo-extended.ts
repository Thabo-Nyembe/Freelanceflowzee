'use server'

/**
 * Extended SEO Server Actions - Covers all 3 SEO-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSEOBacklinks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_backlinks').select('*').eq('user_id', userId).order('discovered_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSEOBacklink(userId: string, input: { source_url: string; target_url: string; anchor_text?: string; domain_authority?: number; is_dofollow?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_backlinks').insert({ user_id: userId, ...input, discovered_at: new Date().toISOString(), status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSEOBacklink(backlinkId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_backlinks').update({ ...updates, last_checked_at: new Date().toISOString() }).eq('id', backlinkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markSEOBacklinkLost(backlinkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_backlinks').update({ status: 'lost', lost_at: new Date().toISOString() }).eq('id', backlinkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSEOBacklink(backlinkId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('seo_backlinks').delete().eq('id', backlinkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSEOKeywords(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_keywords').select('*').eq('user_id', userId).order('search_volume', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSEOKeyword(userId: string, input: { keyword: string; search_volume?: number; difficulty?: number; cpc?: number; intent?: string; current_position?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_keywords').insert({ user_id: userId, ...input, is_tracking: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSEOKeyword(keywordId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_keywords').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', keywordId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSEOKeywordPosition(keywordId: string, position: number) {
  try { const supabase = await createClient(); const { data: keyword, error: keywordError } = await supabase.from('seo_keywords').select('current_position').eq('id', keywordId).single(); if (keywordError) throw keywordError; const { data, error } = await supabase.from('seo_keywords').update({ previous_position: keyword.current_position, current_position: position, position_change: keyword.current_position ? keyword.current_position - position : null, last_checked_at: new Date().toISOString() }).eq('id', keywordId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSEOKeyword(keywordId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('seo_keywords').delete().eq('id', keywordId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSEOPages(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_pages').select('*').eq('user_id', userId).order('url', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSEOPage(userId: string, input: { url: string; title?: string; meta_description?: string; h1?: string; target_keyword?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_pages').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSEOPage(pageId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_pages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSEOPageMetrics(pageId: string, metrics: { page_speed_score?: number; mobile_score?: number; core_web_vitals?: any; indexing_status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('seo_pages').update({ ...metrics, last_audited_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSEOPage(pageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('seo_pages').delete().eq('id', pageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSEOOverview(userId: string) {
  try { const supabase = await createClient(); const [keywords, pages, backlinks] = await Promise.all([supabase.from('seo_keywords').select('*').eq('user_id', userId), supabase.from('seo_pages').select('*').eq('user_id', userId), supabase.from('seo_backlinks').select('*').eq('user_id', userId).eq('status', 'active')]); return { success: true, data: { totalKeywords: keywords.data?.length || 0, totalPages: pages.data?.length || 0, totalBacklinks: backlinks.data?.length || 0, avgPosition: keywords.data?.reduce((sum, k) => sum + (k.current_position || 0), 0) / (keywords.data?.length || 1), avgDomainAuthority: backlinks.data?.reduce((sum, b) => sum + (b.domain_authority || 0), 0) / (backlinks.data?.length || 1) } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
