'use server'

/**
 * Extended Gamification Server Actions
 * Tables: gamification_points, gamification_badges, gamification_achievements, gamification_leaderboards, gamification_rewards, gamification_challenges
 */

import { createClient } from '@/lib/supabase/server'

export async function getUserPoints(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gamification_points').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addPoints(userId: string, points: number, reason: string, metadata?: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('gamification_points').select('*').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('gamification_points').update({ total_points: existing.total_points + points, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; await supabase.from('gamification_points_history').insert({ user_id: userId, points, reason, metadata, created_at: new Date().toISOString() }); return { success: true, data } } else { const { data, error } = await supabase.from('gamification_points').insert({ user_id: userId, total_points: points, level: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('gamification_points_history').insert({ user_id: userId, points, reason, metadata, created_at: new Date().toISOString() }); return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBadge(badgeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gamification_badges').select('*').eq('id', badgeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBadges(options?: { category?: string; rarity?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('gamification_badges').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.rarity) query = query.eq('rarity', options.rarity); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function awardBadge(userId: string, badgeId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_badges').select('*').eq('user_id', userId).eq('badge_id', badgeId).single(); if (existing) return { success: true, data: existing, alreadyAwarded: true }; const { data, error } = await supabase.from('user_badges').insert({ user_id: userId, badge_id: badgeId, awarded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserBadges(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_badges').select('*, gamification_badges(*)').eq('user_id', userId).order('awarded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAchievement(achievementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gamification_achievements').select('*').eq('id', achievementId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAchievements(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('gamification_achievements').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('points', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function unlockAchievement(userId: string, achievementId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_achievements').select('*').eq('user_id', userId).eq('achievement_id', achievementId).single(); if (existing) return { success: true, data: existing, alreadyUnlocked: true }; const { data: achievement } = await supabase.from('gamification_achievements').select('points').eq('id', achievementId).single(); const { data, error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievementId, unlocked_at: new Date().toISOString() }).select().single(); if (error) throw error; if (achievement?.points) await addPoints(userId, achievement.points, 'achievement_unlock', { achievement_id: achievementId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserAchievements(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_achievements').select('*, gamification_achievements(*)').eq('user_id', userId).order('unlocked_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLeaderboard(type: string, options?: { period?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('gamification_leaderboards').select('*').eq('type', type); if (options?.period) query = query.eq('period', options.period); const { data, error } = await query.order('rank', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getChallenge(challengeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gamification_challenges').select('*').eq('id', challengeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveChallenges() {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('gamification_challenges').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now).order('end_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinChallenge(userId: string, challengeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('challenge_participants').insert({ user_id: userId, challenge_id: challengeId, progress: 0, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateChallengeProgress(userId: string, challengeId: string, progress: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('challenge_participants').update({ progress, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('challenge_id', challengeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
