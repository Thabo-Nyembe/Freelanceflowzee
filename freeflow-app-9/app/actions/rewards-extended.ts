'use server'

/**
 * Extended Rewards Server Actions
 * Tables: rewards, reward_types, reward_redemptions, reward_points, reward_tiers, reward_programs
 */

import { createClient } from '@/lib/supabase/server'

export async function getReward(rewardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rewards').select('*, reward_types(*), reward_tiers(*), reward_programs(*)').eq('id', rewardId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReward(rewardData: { name: string; description?: string; type_id: string; program_id?: string; points_required: number; value?: number; quantity_available?: number; start_date?: string; end_date?: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rewards').insert({ ...rewardData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReward(rewardId: string, updates: Partial<{ name: string; description: string; points_required: number; value: number; quantity_available: number; start_date: string; end_date: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rewards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', rewardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReward(rewardId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('rewards').delete().eq('id', rewardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRewards(options?: { program_id?: string; type_id?: string; tier_id?: string; is_active?: boolean; min_points?: number; max_points?: number; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rewards').select('*, reward_types(*), reward_tiers(*), reward_programs(*)'); if (options?.program_id) query = query.eq('program_id', options.program_id); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.tier_id) query = query.eq('tier_id', options.tier_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.min_points) query = query.gte('points_required', options.min_points); if (options?.max_points) query = query.lte('points_required', options.max_points); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('points_required', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function redeemReward(rewardId: string, userId: string, pointsAccountId: string) {
  try { const supabase = await createClient(); const { data: reward } = await supabase.from('rewards').select('points_required, quantity_available').eq('id', rewardId).single(); if (!reward) return { success: false, error: 'Reward not found' }; const { data: account } = await supabase.from('reward_points').select('balance').eq('id', pointsAccountId).single(); if (!account || account.balance < reward.points_required) return { success: false, error: 'Insufficient points' }; if (reward.quantity_available !== null && reward.quantity_available <= 0) return { success: false, error: 'Reward not available' }; const { data: redemption, error: redemptionError } = await supabase.from('reward_redemptions').insert({ reward_id: rewardId, user_id: userId, points_account_id: pointsAccountId, points_used: reward.points_required, status: 'pending', redeemed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (redemptionError) throw redemptionError; await supabase.from('reward_points').update({ balance: account.balance - reward.points_required, updated_at: new Date().toISOString() }).eq('id', pointsAccountId); if (reward.quantity_available !== null) { await supabase.from('rewards').update({ quantity_available: reward.quantity_available - 1, updated_at: new Date().toISOString() }).eq('id', rewardId) } return { success: true, data: redemption } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserPoints(userId: string, programId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('reward_points').select('*, reward_programs(*)').eq('user_id', userId); if (programId) query = query.eq('program_id', programId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPoints(userId: string, programId: string, points: number, reason: string, referenceId?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('reward_points').select('*').eq('user_id', userId).eq('program_id', programId).single(); if (existing) { const { data, error } = await supabase.from('reward_points').update({ balance: existing.balance + points, lifetime_earned: existing.lifetime_earned + points, last_earned_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; await recordPointsTransaction(existing.id, 'earned', points, reason, referenceId); return { success: true, data } } else { const { data, error } = await supabase.from('reward_points').insert({ user_id: userId, program_id: programId, balance: points, lifetime_earned: points, lifetime_redeemed: 0, last_earned_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recordPointsTransaction(data.id, 'earned', points, reason, referenceId); return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recordPointsTransaction(pointsAccountId: string, type: string, points: number, reason: string, referenceId?: string) {
  const supabase = await createClient()
  await supabase.from('reward_points_transactions').insert({ points_account_id: pointsAccountId, type, points, reason, reference_id: referenceId, created_at: new Date().toISOString() })
}

export async function getRewardTypes(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('reward_types').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRewardPrograms(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('reward_programs').select('*, reward_tiers(*)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserRedemptions(userId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reward_redemptions').select('*, rewards(*, reward_types(*))').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('redeemed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserTier(userId: string, programId: string) {
  try { const supabase = await createClient(); const { data: points } = await supabase.from('reward_points').select('lifetime_earned').eq('user_id', userId).eq('program_id', programId).single(); if (!points) return { success: true, data: null }; const { data: tier } = await supabase.from('reward_tiers').select('*').eq('program_id', programId).lte('points_threshold', points.lifetime_earned).order('points_threshold', { ascending: false }).limit(1).single(); return { success: true, data: tier } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

