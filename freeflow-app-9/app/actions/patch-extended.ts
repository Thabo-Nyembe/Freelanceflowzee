'use server'

/**
 * Extended Patch Server Actions - Covers all Patch-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPatch(patchId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('patches').select('*').eq('id', patchId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPatch(patchData: { version: string; patch_number: string; title: string; description?: string; changes?: string[]; fixes?: Array<{ issue_id?: string; description: string; severity?: string }>; is_critical?: boolean; target_version?: string; product_id?: string; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('patches').insert({ ...patchData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePatch(patchId: string, updates: Partial<{ title: string; description: string; changes: string[]; fixes: Array<{ issue_id?: string; description: string; severity?: string }>; is_critical: boolean; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('patches').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', patchId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePatch(patchId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('patches').delete().eq('id', patchId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function releasePatch(patchId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('patches').update({ status: 'released', released_at: new Date().toISOString() }).eq('id', patchId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approvePatch(patchId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('patches').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', patchId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPatches(options?: { productId?: string; version?: string; status?: string; isCritical?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('patches').select('*'); if (options?.productId) query = query.eq('product_id', options.productId); if (options?.version) query = query.eq('version', options.version); if (options?.status) query = query.eq('status', options.status); if (options?.isCritical) query = query.eq('is_critical', true); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCriticalPatches(productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('patches').select('*').eq('is_critical', true).eq('status', 'released'); if (productId) query = query.eq('product_id', productId); const { data, error } = await query.order('released_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPatchesByVersion(version: string, productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('patches').select('*').eq('target_version', version); if (productId) query = query.eq('product_id', productId); const { data, error } = await query.order('patch_number', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
