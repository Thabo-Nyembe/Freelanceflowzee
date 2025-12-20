'use server'

/**
 * Extended Referrals Server Actions
 * Tables: referrals, referral_codes, referral_rewards, referral_tiers, referral_campaigns, referral_payouts
 */

import { createClient } from '@/lib/supabase/server'

export async function getReferral(referralId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('referrals').select('*, referrer:referrer_id(id, full_name, email, avatar_url), referred:referred_id(id, full_name, email, avatar_url), referral_codes(*), referral_rewards(*)').eq('id', referralId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReferral(referralData: { referrer_id: string; referred_id: string; code_id?: string; campaign_id?: string; source?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('referrals').select('id').eq('referred_id', referralData.referred_id).single(); if (existing) return { success: false, error: 'User has already been referred' }; const { data, error } = await supabase.from('referrals').insert({ ...referralData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeReferral(referralId: string) {
  try { const supabase = await createClient(); const { data: referral, error: fetchError } = await supabase.from('referrals').select('*, referral_codes(*)').eq('id', referralId).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from('referrals').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', referralId).select().single(); if (error) throw error; await processRewards(referral); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function processRewards(referral: any) {
  const supabase = await createClient()
  const { data: campaign } = await supabase.from('referral_campaigns').select('*, referral_tiers(*)').eq('id', referral.campaign_id).single()
  if (!campaign) return
  const referrerReward = campaign.referrer_reward || 0
  const referredReward = campaign.referred_reward || 0
  const rewards = []
  if (referrerReward > 0) { rewards.push({ referral_id: referral.id, user_id: referral.referrer_id, type: 'referrer', amount: referrerReward, status: 'pending', created_at: new Date().toISOString() }) }
  if (referredReward > 0) { rewards.push({ referral_id: referral.id, user_id: referral.referred_id, type: 'referred', amount: referredReward, status: 'pending', created_at: new Date().toISOString() }) }
  if (rewards.length > 0) { await supabase.from('referral_rewards').insert(rewards) }
}

export async function getReferrals(options?: { referrer_id?: string; referred_id?: string; campaign_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('referrals').select('*, referrer:referrer_id(id, full_name, email), referred:referred_id(id, full_name, email), referral_codes(*)'); if (options?.referrer_id) query = query.eq('referrer_id', options.referrer_id); if (options?.referred_id) query = query.eq('referred_id', options.referred_id); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReferralCode(codeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('referral_codes').select('*, users(*), referral_campaigns(*)').eq('id', codeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReferralCodeByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('referral_codes').select('*, users(*), referral_campaigns(*)').eq('code', code.toUpperCase()).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid referral code' }; if (!data.is_active) return { success: false, error: 'Referral code is no longer active' }; if (data.expires_at && new Date(data.expires_at) < new Date()) return { success: false, error: 'Referral code has expired' }; if (data.max_uses && data.use_count >= data.max_uses) return { success: false, error: 'Referral code has reached maximum uses' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReferralCode(codeData: { user_id: string; campaign_id?: string; code?: string; max_uses?: number; expires_at?: string }) {
  try { const supabase = await createClient(); const code = codeData.code || generateCode(); const { data, error } = await supabase.from('referral_codes').insert({ ...codeData, code: code.toUpperCase(), is_active: true, use_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) { code += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return code
}

export async function getUserReferralCode(userId: string, campaignId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('referral_codes').select('*, referral_campaigns(*)').eq('user_id', userId).eq('is_active', true); if (campaignId) query = query.eq('campaign_id', campaignId); const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementCodeUsage(codeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.rpc('increment_referral_code_usage', { code_id: codeId }); if (error) { const { data: code } = await supabase.from('referral_codes').select('use_count').eq('id', codeId).single(); await supabase.from('referral_codes').update({ use_count: (code?.use_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', codeId) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReferralRewards(options?: { user_id?: string; referral_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('referral_rewards').select('*, referrals(*), users(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.referral_id) query = query.eq('referral_id', options.referral_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function claimReward(rewardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('referral_rewards').update({ status: 'claimed', claimed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', rewardId).eq('status', 'pending').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReferralCampaigns(options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('referral_campaigns').select('*, referral_tiers(*)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReferralStats(userId: string, options?: { campaign_id?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('referrals').select('status, created_at').eq('referrer_id', userId); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data: referrals } = await query; const { data: rewards } = await supabase.from('referral_rewards').select('amount, status').eq('user_id', userId); const totalReferrals = referrals?.length || 0; const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0; const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0; const totalEarned = rewards?.filter(r => r.status === 'claimed').reduce((sum, r) => sum + (r.amount || 0), 0) || 0; const pendingRewards = rewards?.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0) || 0; return { success: true, data: { totalReferrals, pendingReferrals, completedReferrals, totalEarned, pendingRewards } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopReferrers(options?: { campaign_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('referrals').select('referrer_id, users:referrer_id(id, full_name, email, avatar_url)').eq('status', 'completed'); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); const { data } = await query; const counts: { [key: string]: { user: any; count: number } } = {}; data?.forEach(r => { if (r.referrer_id) { if (!counts[r.referrer_id]) counts[r.referrer_id] = { user: r.users, count: 0 }; counts[r.referrer_id].count++ } }); const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, options?.limit || 10); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
