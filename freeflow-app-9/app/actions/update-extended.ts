'use server'

/**
 * Extended Update Server Actions - Covers all Update-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUpdate(updateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').select('*').eq('id', updateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUpdate(updateData: { update_type: string; title: string; description?: string; version_from?: string; version_to?: string; changes?: string[]; is_mandatory?: boolean; is_breaking?: boolean; download_url?: string; file_size?: number; product_id?: string; user_id?: string; release_notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').insert({ ...updateData, status: 'draft', download_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUpdate(updateId: string, updates: Partial<{ title: string; description: string; changes: string[]; is_mandatory: boolean; is_breaking: boolean; download_url: string; file_size: number; release_notes: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUpdate(updateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('updates').delete().eq('id', updateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishUpdate(updateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordUpdateDownload(updateId: string, userId?: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); await supabase.from('updates').update({ download_count: supabase.rpc('increment_update_downloads', { update_id: updateId }) }).eq('id', updateId); if (userId) { await supabase.from('update_downloads').insert({ update_id: updateId, user_id: userId, metadata, downloaded_at: new Date().toISOString() }); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUpdates(options?: { productId?: string; updateType?: string; status?: string; isMandatory?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*'); if (options?.productId) query = query.eq('product_id', options.productId); if (options?.updateType) query = query.eq('update_type', options.updateType); if (options?.status) query = query.eq('status', options.status); if (options?.isMandatory) query = query.eq('is_mandatory', true); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLatestUpdate(productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*').eq('status', 'published'); if (productId) query = query.eq('product_id', productId); const { data, error } = await query.order('published_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkForUpdates(currentVersion: string, productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*').eq('status', 'published').gt('version_to', currentVersion); if (productId) query = query.eq('product_id', productId); const { data, error } = await query.order('version_to', { ascending: false }); if (error) throw error; const hasUpdates = data && data.length > 0; const hasMandatory = data?.some(u => u.is_mandatory) || false; return { success: true, hasUpdates, hasMandatory, updates: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', hasUpdates: false } }
}

export async function getMandatoryUpdates(currentVersion: string, productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*').eq('status', 'published').eq('is_mandatory', true).gt('version_to', currentVersion); if (productId) query = query.eq('product_id', productId); const { data, error } = await query.order('version_to', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
