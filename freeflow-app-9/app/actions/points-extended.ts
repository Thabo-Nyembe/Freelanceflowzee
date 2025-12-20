'use server'

/**
 * Extended Points Server Actions
 * Tables: points, point_transactions, point_rules, point_rewards, point_redemptions, point_tiers
 */

import { createClient } from '@/lib/supabase/server'

export async function getPoints(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('points').select('*, point_tiers(*)').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addPoints(userId: string, pointData: { amount: number; reason: string; source?: string; reference_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('points').select('id, balance, lifetime_earned').eq('user_id', userId).single(); if (current) { await supabase.from('points').update({ balance: current.balance + pointData.amount, lifetime_earned: current.lifetime_earned + pointData.amount, updated_at: new Date().toISOString() }).eq('id', current.id) } else { await supabase.from('points').insert({ user_id: userId, balance: pointData.amount, lifetime_earned: pointData.amount, lifetime_spent: 0, created_at: new Date().toISOString() }) } const { data, error } = await supabase.from('point_transactions').insert({ user_id: userId, amount: pointData.amount, type: 'earn', ...pointData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await checkTierUpgrade(userId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deductPoints(userId: string, pointData: { amount: number; reason: string; reference_id?: string }) {
  try { const supabase = await createClient(); const { data: current, error: fetchError } = await supabase.from('points').select('id, balance, lifetime_spent').eq('user_id', userId).single(); if (fetchError || !current) return { success: false, error: 'No points balance found' }; if (current.balance < pointData.amount) return { success: false, error: 'Insufficient points' }; await supabase.from('points').update({ balance: current.balance - pointData.amount, lifetime_spent: current.lifetime_spent + pointData.amount, updated_at: new Date().toISOString() }).eq('id', current.id); const { data, error } = await supabase.from('point_transactions').insert({ user_id: userId, amount: -pointData.amount, type: 'spend', ...pointData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactions(userId: string, options?: { type?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('point_transactions').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRule(ruleData: { name: string; action: string; points: number; description?: string; conditions?: any; is_active?: boolean; max_per_day?: number; max_per_user?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('point_rules').insert({ ...ruleData, is_active: ruleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRule(ruleId: string, updates: Partial<{ name: string; points: number; description: string; conditions: any; is_active: boolean; max_per_day: number; max_per_user: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('point_rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(options?: { action?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('point_rules').select('*'); if (options?.action) query = query.eq('action', options.action); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function applyRule(userId: string, action: string, metadata?: any): Promise<{ success: boolean; points?: number; error?: string }> {
  try { const supabase = await createClient(); const { data: rule } = await supabase.from('point_rules').select('*').eq('action', action).eq('is_active', true).single(); if (!rule) return { success: false, error: 'No rule found for action' }; if (rule.max_per_day) { const today = new Date(); today.setHours(0, 0, 0, 0); const { data: todayTransactions } = await supabase.from('point_transactions').select('id').eq('user_id', userId).eq('source', action).gte('created_at', today.toISOString()); if ((todayTransactions?.length || 0) >= rule.max_per_day) return { success: false, error: 'Daily limit reached' } } const result = await addPoints(userId, { amount: rule.points, reason: rule.name, source: action, metadata }); return { success: result.success, points: rule.points, error: result.error } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReward(rewardData: { name: string; description?: string; points_required: number; reward_type: string; reward_value?: any; quantity_available?: number; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('point_rewards').insert({ ...rewardData, is_active: true, redemption_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRewards(options?: { is_active?: boolean; reward_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('point_rewards').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.reward_type) query = query.eq('reward_type', options.reward_type); const { data, error } = await query.order('points_required', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function redeemReward(userId: string, rewardId: string) {
  try { const supabase = await createClient(); const { data: reward, error: rewardError } = await supabase.from('point_rewards').select('*').eq('id', rewardId).eq('is_active', true).single(); if (rewardError || !reward) return { success: false, error: 'Reward not found or inactive' }; if (reward.expires_at && new Date(reward.expires_at) < new Date()) return { success: false, error: 'Reward has expired' }; if (reward.quantity_available !== null && reward.quantity_available <= 0) return { success: false, error: 'Reward out of stock' }; const deductResult = await deductPoints(userId, { amount: reward.points_required, reason: `Redeemed: ${reward.name}`, reference_id: rewardId }); if (!deductResult.success) return deductResult; const { data, error } = await supabase.from('point_redemptions').insert({ user_id: userId, reward_id: rewardId, points_spent: reward.points_required, status: 'completed', redeemed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('point_rewards').update({ redemption_count: reward.redemption_count + 1, quantity_available: reward.quantity_available !== null ? reward.quantity_available - 1 : null }).eq('id', rewardId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRedemptions(userId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('point_redemptions').select('*, point_rewards(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('redeemed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTiers() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('point_tiers').select('*').order('min_points', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

async function checkTierUpgrade(userId: string) {
  const supabase = await createClient()
  const { data: points } = await supabase.from('points').select('lifetime_earned, tier_id').eq('user_id', userId).single()
  if (!points) return
  const { data: tiers } = await supabase.from('point_tiers').select('*').lte('min_points', points.lifetime_earned).order('min_points', { ascending: false }).limit(1)
  if (tiers && tiers.length > 0 && tiers[0].id !== points.tier_id) {
    await supabase.from('points').update({ tier_id: tiers[0].id, updated_at: new Date().toISOString() }).eq('user_id', userId)
  }
}
