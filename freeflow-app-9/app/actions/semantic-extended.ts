'use server'

/**
 * Extended Semantic Server Actions
 * Tables: semantic_embeddings, semantic_indexes, semantic_searches, semantic_clusters
 */

import { createClient } from '@/lib/supabase/server'

export async function getSemanticEmbedding(embeddingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('semantic_embeddings').select('*').eq('id', embeddingId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSemanticEmbedding(embeddingData: { content_type: string; content_id: string; embedding: number[]; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('semantic_embeddings').insert({ ...embeddingData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSemanticEmbeddings(options?: { content_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('semantic_embeddings').select('*'); if (options?.content_type) query = query.eq('content_type', options.content_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSemanticIndexes(options?: { index_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('semantic_indexes').select('*'); if (options?.index_type) query = query.eq('index_type', options.index_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSemanticSearch(searchData: { user_id: string; query: string; embedding?: number[]; results?: any[]; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('semantic_searches').insert({ ...searchData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSemanticSearches(options?: { user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('semantic_searches').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSemanticClusters(options?: { index_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('semantic_clusters').select('*'); if (options?.index_id) query = query.eq('index_id', options.index_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
