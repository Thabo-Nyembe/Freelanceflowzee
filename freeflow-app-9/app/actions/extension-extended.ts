'use server'

/**
 * Extended Extension Server Actions - Covers all Extension-related tables
 * Tables: extensions, extension_installations, extension_settings, extension_permissions
 */

import { createClient } from '@/lib/supabase/server'

export async function getExtension(extensionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').select('*, extension_permissions(*)').eq('id', extensionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExtension(extensionData: { name: string; description?: string; developer_id: string; version: string; category?: string; icon_url?: string; manifest?: Record<string, any>; permissions?: string[]; pricing_type?: 'free' | 'paid' | 'freemium'; price?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').insert({ ...extensionData, status: 'pending', install_count: 0, rating: 0, rating_count: 0, pricing_type: extensionData.pricing_type || 'free', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExtension(extensionId: string, updates: Partial<{ name: string; description: string; version: string; category: string; icon_url: string; manifest: Record<string, any>; permissions: string[]; status: string; pricing_type: string; price: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', extensionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteExtension(extensionId: string) {
  try { const supabase = await createClient(); await supabase.from('extension_settings').delete().eq('extension_id', extensionId); await supabase.from('extension_installations').delete().eq('extension_id', extensionId); await supabase.from('extension_permissions').delete().eq('extension_id', extensionId); const { error } = await supabase.from('extensions').delete().eq('id', extensionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExtensions(options?: { category?: string; pricing_type?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('extensions').select('*').eq('status', 'published'); if (options?.category) query = query.eq('category', options.category); if (options?.pricing_type) query = query.eq('pricing_type', options.pricing_type); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`); const { data, error } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDeveloperExtensions(developerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').select('*').eq('developer_id', developerId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function installExtension(installationData: { extension_id: string; user_id: string; granted_permissions?: string[] }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('extension_installations').select('id').eq('extension_id', installationData.extension_id).eq('user_id', installationData.user_id).single(); if (existing) return { success: false, error: 'Extension already installed' }; const { data, error } = await supabase.from('extension_installations').insert({ ...installationData, is_enabled: true, installed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_extension_install_count', { ext_id: installationData.extension_id }).catch(() => {}); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallExtension(extensionId: string, userId: string) {
  try { const supabase = await createClient(); await supabase.from('extension_settings').delete().eq('extension_id', extensionId).eq('user_id', userId); const { error } = await supabase.from('extension_installations').delete().eq('extension_id', extensionId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleExtension(extensionId: string, userId: string, isEnabled: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_installations').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('extension_id', extensionId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserInstalledExtensions(userId: string, options?: { is_enabled?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('extension_installations').select('*, extensions(*)').eq('user_id', userId); if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled); const { data, error } = await query.order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExtensionSettings(extensionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_settings').select('*').eq('extension_id', extensionId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExtensionSettings(extensionId: string, userId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('extension_settings').select('id').eq('extension_id', extensionId).eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('extension_settings').update({ settings, updated_at: new Date().toISOString() }).eq('extension_id', extensionId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('extension_settings').insert({ extension_id: extensionId, user_id: userId, settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExtensionPermissions(extensionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_permissions').select('*').eq('extension_id', extensionId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addExtensionPermission(permissionData: { extension_id: string; name: string; description?: string; is_required?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_permissions').insert({ ...permissionData, is_required: permissionData.is_required ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rateExtension(extensionId: string, userId: string, rating: number, review?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('extension_reviews').select('id').eq('extension_id', extensionId).eq('user_id', userId).single(); if (existing) { await supabase.from('extension_reviews').update({ rating, review, updated_at: new Date().toISOString() }).eq('id', existing.id) } else { await supabase.from('extension_reviews').insert({ extension_id: extensionId, user_id: userId, rating, review, created_at: new Date().toISOString() }) } const { data: reviews } = await supabase.from('extension_reviews').select('rating').eq('extension_id', extensionId); if (reviews && reviews.length > 0) { const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length; await supabase.from('extensions').update({ rating: avgRating, rating_count: reviews.length }).eq('id', extensionId) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExtensionReviews(extensionId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_reviews').select('*').eq('extension_id', extensionId).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishExtension(extensionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', extensionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExtensionCategories() {
  try { const supabase = await createClient(); const { data } = await supabase.from('extensions').select('category').eq('status', 'published'); const categories = [...new Set((data || []).map(e => e.category).filter(Boolean))]; return { success: true, data: categories } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
