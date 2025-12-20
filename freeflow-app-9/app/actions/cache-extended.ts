'use server'

/**
 * Extended Cache Server Actions - Covers all Cache-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCacheEntry(key: string, namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('cache_entries').select('*').eq('cache_key', key); if (namespace) query = query.eq('namespace', namespace); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; if (data && data.expires_at && new Date(data.expires_at) < new Date()) { await supabase.from('cache_entries').delete().eq('id', data.id); return { success: true, data: null, expired: true }; } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setCacheEntry(key: string, value: any, ttlSeconds?: number, namespace?: string) {
  try { const supabase = await createClient(); const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : null; const { data, error } = await supabase.from('cache_entries').upsert({ cache_key: key, value, namespace, expires_at: expiresAt, updated_at: new Date().toISOString() }, { onConflict: 'cache_key,namespace' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCacheEntry(key: string, namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('cache_entries').delete().eq('cache_key', key); if (namespace) query = query.eq('namespace', namespace); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearCacheNamespace(namespace: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('cache_entries').delete().eq('namespace', namespace); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearExpiredCache() {
  try { const supabase = await createClient(); const { error } = await supabase.from('cache_entries').delete().lt('expires_at', new Date().toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCacheStats(namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('cache_entries').select('*', { count: 'exact', head: true }); if (namespace) query = query.eq('namespace', namespace); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getCacheKeys(namespace?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('cache_entries').select('cache_key, namespace, expires_at').limit(limit); if (namespace) query = query.eq('namespace', namespace); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function extendCacheTTL(key: string, additionalSeconds: number, namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('cache_entries').select('expires_at').eq('cache_key', key); if (namespace) query = query.eq('namespace', namespace); const { data } = await query.single(); if (!data) return { success: false, error: 'Cache entry not found' }; const currentExpiry = data.expires_at ? new Date(data.expires_at) : new Date(); const newExpiry = new Date(currentExpiry.getTime() + additionalSeconds * 1000); let updateQuery = supabase.from('cache_entries').update({ expires_at: newExpiry.toISOString() }).eq('cache_key', key); if (namespace) updateQuery = updateQuery.eq('namespace', namespace); const { error } = await updateQuery; if (error) throw error; return { success: true, expiresAt: newExpiry.toISOString() } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
