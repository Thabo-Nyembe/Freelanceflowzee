'use server'

/**
 * Extended Achievements Server Actions - Covers all Achievement-related tables
 * Tables: achievements
 */

import { createClient } from '@/lib/supabase/server'

export async function getAchievement(achievementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('achievements').select('*').eq('id', achievementId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAchievement(achievementData: { name: string; description: string; icon?: string; badge_url?: string; points?: number; category?: string; requirements?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('achievements').insert({ ...achievementData, points: achievementData.points || 0, is_active: achievementData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAchievement(achievementId: string, updates: Partial<{ name: string; description: string; icon: string; badge_url: string; points: number; category: string; requirements: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('achievements').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', achievementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAchievement(achievementId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('achievements').delete().eq('id', achievementId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAchievements(options?: { category?: string; isActive?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('achievements').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('points', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function awardAchievement(userId: string, achievementId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_achievements').select('id').eq('user_id', userId).eq('achievement_id', achievementId).single(); if (existing) return { success: false, error: 'Achievement already awarded' }; const { data, error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievementId, earned_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserAchievements(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', userId).order('earned_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkAchievementProgress(userId: string, achievementId: string) {
  try { const supabase = await createClient(); const { data: achievement } = await supabase.from('achievements').select('requirements').eq('id', achievementId).single(); const { data: earned } = await supabase.from('user_achievements').select('id').eq('user_id', userId).eq('achievement_id', achievementId).single(); return { success: true, data: { isEarned: !!earned, requirements: achievement?.requirements } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAchievementLeaderboard(achievementId?: string, limit?: number) {
  try { const supabase = await createClient(); let query = supabase.from('user_achievements').select('user_id, count', { count: 'exact' }); if (achievementId) query = query.eq('achievement_id', achievementId); const { data, error } = await supabase.rpc('get_achievement_leaderboard', { limit_count: limit || 10 }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAchievementsByCategory() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('achievements').select('category, id, name').eq('is_active', true).order('category'); if (error) throw error; const grouped: Record<string, any[]> = {}; data?.forEach(a => { if (!grouped[a.category || 'general']) grouped[a.category || 'general'] = []; grouped[a.category || 'general'].push(a); }); return { success: true, data: grouped } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
