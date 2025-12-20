'use server'

/**
 * Extended Creator Server Actions
 * Tables: creators, creator_profiles, creator_content, creator_earnings, creator_followers
 */

import { createClient } from '@/lib/supabase/server'

export async function getCreator(creatorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('creators').select('*, creator_profiles(*)').eq('id', creatorId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCreator(creatorData: { user_id: string; display_name: string; bio?: string; category?: string; website?: string; social_links?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('creators').insert({ ...creatorData, is_verified: false, follower_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCreator(creatorId: string, updates: Partial<{ display_name: string; bio: string; category: string; website: string; social_links: any; is_verified: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('creators').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', creatorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCreators(options?: { category?: string; is_verified?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('creators').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_verified !== undefined) query = query.eq('is_verified', options.is_verified); if (options?.search) query = query.ilike('display_name', `%${options.search}%`); const { data, error } = await query.order('follower_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCreatorContent(creatorId: string, options?: { type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('creator_content').select('*').eq('creator_id', creatorId); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCreatorContent(contentData: { creator_id: string; title: string; description?: string; type: string; content_url?: string; thumbnail?: string; is_premium?: boolean; price?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('creator_content').insert({ ...contentData, status: 'draft', view_count: 0, like_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function followCreator(creatorId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('creator_followers').insert({ creator_id: creatorId, user_id: userId, followed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_follower_count', { creator_id: creatorId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unfollowCreator(creatorId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('creator_followers').delete().eq('creator_id', creatorId).eq('user_id', userId); if (error) throw error; await supabase.rpc('decrement_follower_count', { creator_id: creatorId }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCreatorEarnings(creatorId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('creator_earnings').select('*').eq('creator_id', creatorId); if (options?.date_from) query = query.gte('earned_at', options.date_from); if (options?.date_to) query = query.lte('earned_at', options.date_to); const { data, error } = await query.order('earned_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
