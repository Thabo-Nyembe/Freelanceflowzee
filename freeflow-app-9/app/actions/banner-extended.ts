'use server'

/**
 * Extended Banner Server Actions - Covers all Banner-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBanners(location?: string, isActive?: boolean, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('banners').select('*').order('priority', { ascending: false }).limit(limit); if (location) query = query.eq('location', location); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBanner(bannerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('banners').select('*').eq('id', bannerId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBanner(input: { title: string; content?: string; image_url?: string; link_url?: string; link_text?: string; location: string; banner_type?: string; priority?: number; start_date?: string; end_date?: string; background_color?: string; text_color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('banners').insert({ ...input, is_active: true, view_count: 0, click_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBanner(bannerId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('banners').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', bannerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBanner(bannerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('banners').delete().eq('id', bannerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleBannerActive(bannerId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('banners').update({ is_active: isActive }).eq('id', bannerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveBanners(location?: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); let query = supabase.from('banners').select('*').eq('is_active', true).or(`start_date.is.null,start_date.lte.${now}`).or(`end_date.is.null,end_date.gte.${now}`).order('priority', { ascending: false }); if (location) query = query.eq('location', location); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function incrementBannerView(bannerId: string) {
  try { const supabase = await createClient(); const { data: banner } = await supabase.from('banners').select('view_count').eq('id', bannerId).single(); const { data, error } = await supabase.from('banners').update({ view_count: (banner?.view_count || 0) + 1, last_viewed_at: new Date().toISOString() }).eq('id', bannerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementBannerClick(bannerId: string) {
  try { const supabase = await createClient(); const { data: banner } = await supabase.from('banners').select('click_count').eq('id', bannerId).single(); const { data, error } = await supabase.from('banners').update({ click_count: (banner?.click_count || 0) + 1, last_clicked_at: new Date().toISOString() }).eq('id', bannerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBannerStats(bannerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('banners').select('view_count, click_count').eq('id', bannerId).single(); if (error) throw error; const ctr = data?.view_count > 0 ? (data.click_count / data.view_count) * 100 : 0; return { success: true, data: { ...data, ctr } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateBanner(bannerId: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('banners').select('*').eq('id', bannerId).single(); if (origError) throw origError; const { id, created_at, updated_at, view_count, click_count, ...bannerData } = original; const { data, error } = await supabase.from('banners').insert({ ...bannerData, title: `Copy of ${original.title}`, is_active: false, view_count: 0, click_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderBanners(bannerIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < bannerIds.length; i++) { await supabase.from('banners').update({ priority: bannerIds.length - i }).eq('id', bannerIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBannersByDateRange(startDate: string, endDate: string, location?: string) {
  try { const supabase = await createClient(); let query = supabase.from('banners').select('*').or(`start_date.lte.${endDate},start_date.is.null`).or(`end_date.gte.${startDate},end_date.is.null`).order('priority', { ascending: false }); if (location) query = query.eq('location', location); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
