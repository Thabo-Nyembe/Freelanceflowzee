'use server'

/**
 * Extended Loyalty Server Actions
 * Tables: loyalty_programs, loyalty_members, loyalty_points, loyalty_rewards, loyalty_tiers, loyalty_transactions
 */

import { createClient } from '@/lib/supabase/server'

export async function getLoyaltyProgram(programId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_programs').select('*, loyalty_tiers(*), loyalty_rewards(*)').eq('id', programId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLoyaltyProgram(programData: { name: string; description?: string; organization_id: string; points_per_dollar?: number; points_currency_name?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_programs').insert({ ...programData, points_per_dollar: programData.points_per_dollar || 1, points_currency_name: programData.points_currency_name || 'points', is_active: true, member_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLoyaltyProgram(programId: string, updates: Partial<{ name: string; description: string; points_per_dollar: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_programs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', programId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function enrollMember(enrollmentData: { program_id: string; user_id: string; tier_id?: string }) {
  try { const supabase = await createClient(); const memberNumber = `MBR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`; const { data, error } = await supabase.from('loyalty_members').insert({ ...enrollmentData, member_number: memberNumber, points_balance: 0, lifetime_points: 0, status: 'active', enrolled_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: program } = await supabase.from('loyalty_programs').select('member_count').eq('id', enrollmentData.program_id).single(); await supabase.from('loyalty_programs').update({ member_count: (program?.member_count || 0) + 1 }).eq('id', enrollmentData.program_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMember(memberId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_members').select('*, loyalty_programs(*), loyalty_tiers(*)').eq('id', memberId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMemberByUser(userId: string, programId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_members').select('*, loyalty_programs(*), loyalty_tiers(*)').eq('user_id', userId).eq('program_id', programId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function earnPoints(transactionData: { member_id: string; points: number; description: string; reference_type?: string; reference_id?: string }) {
  try { const supabase = await createClient(); const { data: transaction, error } = await supabase.from('loyalty_transactions').insert({ ...transactionData, type: 'earn', created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: member } = await supabase.from('loyalty_members').select('points_balance, lifetime_points').eq('id', transactionData.member_id).single(); await supabase.from('loyalty_members').update({ points_balance: (member?.points_balance || 0) + transactionData.points, lifetime_points: (member?.lifetime_points || 0) + transactionData.points, updated_at: new Date().toISOString() }).eq('id', transactionData.member_id); return { success: true, data: transaction } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function redeemPoints(transactionData: { member_id: string; points: number; reward_id?: string; description: string }) {
  try { const supabase = await createClient(); const { data: member } = await supabase.from('loyalty_members').select('points_balance').eq('id', transactionData.member_id).single(); if (!member || member.points_balance < transactionData.points) return { success: false, error: 'Insufficient points' }; const { data: transaction, error } = await supabase.from('loyalty_transactions').insert({ ...transactionData, type: 'redeem', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('loyalty_members').update({ points_balance: member.points_balance - transactionData.points, updated_at: new Date().toISOString() }).eq('id', transactionData.member_id); return { success: true, data: transaction } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactions(memberId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('loyalty_transactions').select('*').eq('member_id', memberId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRewards(programId: string, options?: { is_active?: boolean; tier_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('loyalty_rewards').select('*').eq('program_id', programId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.tier_id) query = query.or(`min_tier_id.is.null,min_tier_id.eq.${options.tier_id}`); const { data, error } = await query.order('points_cost', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReward(rewardData: { program_id: string; name: string; description?: string; points_cost: number; quantity?: number; min_tier_id?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_rewards').insert({ ...rewardData, is_active: true, redemption_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTiers(programId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_tiers').select('*').eq('program_id', programId).order('min_points', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTier(tierData: { program_id: string; name: string; min_points: number; benefits?: string[]; multiplier?: number; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('loyalty_tiers').insert({ ...tierData, multiplier: tierData.multiplier || 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMemberTier(memberId: string) {
  try { const supabase = await createClient(); const { data: member } = await supabase.from('loyalty_members').select('program_id, lifetime_points').eq('id', memberId).single(); if (!member) return { success: false, error: 'Member not found' }; const { data: tiers } = await supabase.from('loyalty_tiers').select('id, min_points').eq('program_id', member.program_id).order('min_points', { ascending: false }); const newTier = tiers?.find(t => member.lifetime_points >= t.min_points); if (newTier) { const { data, error } = await supabase.from('loyalty_members').update({ tier_id: newTier.id, updated_at: new Date().toISOString() }).eq('id', memberId).select().single(); if (error) throw error; return { success: true, data } } return { success: true, data: null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
