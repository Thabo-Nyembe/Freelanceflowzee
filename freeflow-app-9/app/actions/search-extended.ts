'use server'

/**
 * Extended Search Server Actions - Covers all Search-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function saveSearchQuery(userId: string, query: string, resultCount: number, filters?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('search_queries').insert({ user_id: userId, query, result_count: resultCount, filters }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSearchHistory(userId: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('search_queries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function clearSearchHistory(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('search_queries').delete().eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPopularSearches(limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('search_queries').select('query').order('created_at', { ascending: false }).limit(1000); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(s => { counts[s.query] = (counts[s.query] || 0) + 1; }); const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([query, count]) => ({ query, count })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveSearchResult(queryId: string, results: any[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('search_results').insert({ query_id: queryId, results, result_count: results.length }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSavedSearches(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveSearch(userId: string, name: string, query: string, filters?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('saved_searches').insert({ user_id: userId, name, query, filters }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSavedSearch(searchId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('saved_searches').delete().eq('id', searchId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSearchSuggestions(query: string, limit = 5) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('search_queries').select('query').ilike('query', `${query}%`).limit(limit); if (error) throw error; const unique = [...new Set(data?.map(s => s.query) || [])]; return { success: true, data: unique } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
