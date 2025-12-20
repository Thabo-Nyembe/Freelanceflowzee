'use server'

/**
 * Extended Wasabi Server Actions
 * Tables: wasabi_buckets, wasabi_objects, wasabi_uploads, wasabi_access_keys
 */

import { createClient } from '@/lib/supabase/server'

export async function getWasabiBucket(bucketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wasabi_buckets').select('*').eq('id', bucketId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWasabiBucket(bucketData: { name: string; region?: string; is_public?: boolean; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wasabi_buckets').insert({ ...bucketData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWasabiBuckets(options?: { user_id?: string; is_public?: boolean; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('wasabi_buckets').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWasabiObjects(bucketId: string, options?: { prefix?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('wasabi_objects').select('*').eq('bucket_id', bucketId); if (options?.prefix) query = query.like('key', `${options.prefix}%`); const { data, error } = await query.order('key', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWasabiObject(objectData: { bucket_id: string; key: string; size: number; content_type?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wasabi_objects').insert({ ...objectData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWasabiObject(objectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('wasabi_objects').delete().eq('id', objectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWasabiUploads(options?: { bucket_id?: string; user_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('wasabi_uploads').select('*'); if (options?.bucket_id) query = query.eq('bucket_id', options.bucket_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWasabiAccessKeys(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wasabi_access_keys').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
