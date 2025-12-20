'use server'

/**
 * Extended Marketplace Server Actions - Covers all 3 Marketplace-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMarketplaceApps(category?: string, publishedOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('marketplace_apps').select('*').order('name', { ascending: true }); if (category) query = query.eq('category', category); if (publishedOnly) query = query.eq('is_published', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMarketplaceApp(appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_apps').select('*').eq('id', appId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMarketplaceApp(developerId: string, input: { name: string; description: string; category: string; icon_url?: string; screenshots?: string[]; pricing_type: string; price?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_apps').insert({ developer_id: developerId, ...input, is_published: false, install_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMarketplaceApp(appId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_apps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishMarketplaceApp(appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_apps').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishMarketplaceApp(appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_apps').update({ is_published: false }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchMarketplaceApps(query: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_apps').select('*').eq('is_published', true).or(`name.ilike.%${query}%,description.ilike.%${query}%`).order('install_count', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMarketplaceCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_categories').select('*').order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMarketplaceCategory(input: { name: string; slug: string; description?: string; icon?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_categories').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMarketplaceCategory(categoryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_categories').update(updates).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMarketplaceInstallations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_installations').select('*').eq('user_id', userId).order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function installMarketplaceApp(userId: string, appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_installations').insert({ user_id: userId, app_id: appId, installed_at: new Date().toISOString(), is_active: true }).select().single(); if (error) throw error; await supabase.rpc('increment', { table_name: 'marketplace_apps', column_name: 'install_count', row_id: appId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallMarketplaceApp(installationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_installations').update({ is_active: false, uninstalled_at: new Date().toISOString() }).eq('id', installationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMarketplaceInstallationSettings(installationId: string, settings: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketplace_installations').update({ settings }).eq('id', installationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
