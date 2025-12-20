'use server'

/**
 * Extended Portfolios Server Actions
 * Tables: portfolios, portfolio_items, portfolio_categories, portfolio_views, portfolio_testimonials, portfolio_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getPortfolio(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolios').select('*, portfolio_items(*), portfolio_categories(*), portfolio_testimonials(*)').eq('id', portfolioId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolios').select('*, portfolio_items(*), portfolio_categories(*), portfolio_testimonials(*)').eq('slug', slug).eq('is_public', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPortfolio(portfolioData: { title: string; slug: string; description?: string; owner_id: string; template?: string; theme?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolios').insert({ ...portfolioData, is_public: false, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortfolio(portfolioId: string, updates: Partial<{ title: string; description: string; slug: string; is_public: boolean; template: string; theme: any; custom_domain: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolios').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', portfolioId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePortfolio(portfolioId: string) {
  try { const supabase = await createClient(); await supabase.from('portfolio_items').delete().eq('portfolio_id', portfolioId); await supabase.from('portfolio_categories').delete().eq('portfolio_id', portfolioId); await supabase.from('portfolio_testimonials').delete().eq('portfolio_id', portfolioId); await supabase.from('portfolio_settings').delete().eq('portfolio_id', portfolioId); const { error } = await supabase.from('portfolios').delete().eq('id', portfolioId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolios(options?: { owner_id?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('portfolios').select('*, portfolio_items(count)'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(portfolioId: string, itemData: { title: string; description?: string; category_id?: string; media_url?: string; thumbnail_url?: string; link_url?: string; tags?: string[]; order?: number; metadata?: any }) {
  try { const supabase = await createClient(); const { data: lastItem } = await supabase.from('portfolio_items').select('order').eq('portfolio_id', portfolioId).order('order', { ascending: false }).limit(1).single(); const { data, error } = await supabase.from('portfolio_items').insert({ portfolio_id: portfolioId, ...itemData, order: itemData.order ?? ((lastItem?.order || 0) + 1), is_featured: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateItem(itemId: string, updates: Partial<{ title: string; description: string; category_id: string; media_url: string; thumbnail_url: string; link_url: string; tags: string[]; order: number; is_featured: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderItems(portfolioId: string, itemOrders: { id: string; order: number }[]) {
  try { const supabase = await createClient(); for (const item of itemOrders) { await supabase.from('portfolio_items').update({ order: item.order }).eq('id', item.id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItems(portfolioId: string, options?: { category_id?: string; is_featured?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('portfolio_items').select('*, portfolio_categories(*)').eq('portfolio_id', portfolioId); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_featured !== undefined) query = query.eq('is_featured', options.is_featured); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCategory(portfolioId: string, categoryData: { name: string; description?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_categories').insert({ portfolio_id: portfolioId, ...categoryData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_categories').select('*, portfolio_items(count)').eq('portfolio_id', portfolioId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordView(portfolioId: string, viewerData?: { ip_address?: string; user_agent?: string; referrer?: string }) {
  try { const supabase = await createClient(); await supabase.from('portfolio_views').insert({ portfolio_id: portfolioId, ...viewerData, viewed_at: new Date().toISOString() }); await supabase.from('portfolios').update({ view_count: supabase.sql`view_count + 1` }).eq('id', portfolioId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addTestimonial(portfolioId: string, testimonialData: { author_name: string; author_title?: string; author_company?: string; author_image_url?: string; content: string; rating?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_testimonials').insert({ portfolio_id: portfolioId, ...testimonialData, is_approved: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveTestimonial(testimonialId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_testimonials').update({ is_approved: true, approved_at: new Date().toISOString() }).eq('id', testimonialId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSettings(portfolioId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('portfolio_settings').select('id').eq('portfolio_id', portfolioId).single(); if (existing) { const { data, error } = await supabase.from('portfolio_settings').update({ settings, updated_at: new Date().toISOString() }).eq('portfolio_id', portfolioId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('portfolio_settings').insert({ portfolio_id: portfolioId, settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
