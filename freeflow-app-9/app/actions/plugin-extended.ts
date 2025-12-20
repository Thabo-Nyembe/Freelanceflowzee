'use server'

/**
 * Extended Plugin Server Actions - Covers all 7 Plugin-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPluginAnalytics(pluginId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_analytics').select('*').eq('plugin_id', pluginId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePluginAnalytics(pluginId: string, analytics: { installs?: number; active_users?: number; views?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_analytics').upsert({ plugin_id: pluginId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPluginAuthors() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_authors').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPluginAuthor(input: { name: string; email: string; website?: string; bio?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_authors').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPluginCollections(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_collections').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPluginCollection(userId: string, name: string, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_collections').insert({ user_id: userId, name, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPluginDownloads(pluginId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_downloads').select('*').eq('plugin_id', pluginId).order('downloaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackPluginDownload(pluginId: string, userId?: string, version?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_downloads').insert({ plugin_id: pluginId, user_id: userId, version, downloaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPluginReviews(pluginId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_reviews').select('*').eq('plugin_id', pluginId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPluginReview(pluginId: string, userId: string, rating: number, review: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_reviews').insert({ plugin_id: pluginId, user_id: userId, rating, review }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPluginVersions(pluginId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_versions').select('*').eq('plugin_id', pluginId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPluginVersion(pluginId: string, input: { version: string; changelog?: string; download_url: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_versions').insert({ plugin_id: pluginId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPluginWishlists(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_wishlists').select('*').eq('user_id', userId).order('added_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addToPluginWishlist(userId: string, pluginId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_wishlists').insert({ user_id: userId, plugin_id: pluginId, added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeFromPluginWishlist(userId: string, pluginId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('plugin_wishlists').delete().eq('user_id', userId).eq('plugin_id', pluginId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
