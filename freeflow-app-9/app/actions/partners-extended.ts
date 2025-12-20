'use server'

/**
 * Extended Partners Server Actions
 * Tables: partners, partner_applications, partner_tiers, partner_commissions, partner_referrals, partner_payouts
 */

import { createClient } from '@/lib/supabase/server'

export async function getPartner(partnerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partners').select('*, partner_tiers(*), partner_commissions(*), partner_referrals(*)').eq('id', partnerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyForPartnership(applicationData: { user_id: string; organization_id?: string; company_name?: string; website?: string; description: string; marketing_channels?: string[]; expected_referrals?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_applications').insert({ ...applicationData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveApplication(applicationId: string, tierData?: { tier_id?: string; commission_rate?: number }) {
  try { const supabase = await createClient(); const { data: application, error: appError } = await supabase.from('partner_applications').select('*').eq('id', applicationId).single(); if (appError) throw appError; const partnerCode = `PARTNER-${Date.now().toString(36).toUpperCase()}`; const { data: partner, error: partnerError } = await supabase.from('partners').insert({ user_id: application.user_id, organization_id: application.organization_id, partner_code: partnerCode, tier_id: tierData?.tier_id, commission_rate: tierData?.commission_rate || 10, status: 'active', created_at: new Date().toISOString() }).select().single(); if (partnerError) throw partnerError; await supabase.from('partner_applications').update({ status: 'approved', approved_at: new Date().toISOString(), partner_id: partner.id }).eq('id', applicationId); return { success: true, data: partner } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectApplication(applicationId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_applications').update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date().toISOString() }).eq('id', applicationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePartner(partnerId: string, updates: Partial<{ tier_id: string; commission_rate: number; status: string; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partners').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', partnerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPartners(options?: { tier_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('partners').select('*, partner_tiers(*), users(*)'); if (options?.tier_id) query = query.eq('tier_id', options.tier_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('partner_code', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getApplications(options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('partner_applications').select('*, users(*)'); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTier(tierData: { name: string; commission_rate: number; min_referrals?: number; benefits?: string[]; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_tiers').insert({ ...tierData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTier(tierId: string, updates: Partial<{ name: string; commission_rate: number; min_referrals: number; benefits: string[]; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_tiers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackReferral(referralData: { partner_id: string; referred_user_id?: string; referred_email?: string; source?: string; campaign?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_referrals').insert({ ...referralData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertReferral(referralId: string, conversionData: { converted_user_id: string; conversion_value: number }) {
  try { const supabase = await createClient(); const { data: referral, error: refError } = await supabase.from('partner_referrals').update({ status: 'converted', ...conversionData, converted_at: new Date().toISOString() }).eq('id', referralId).select().single(); if (refError) throw refError; const { data: partner } = await supabase.from('partners').select('commission_rate').eq('id', referral.partner_id).single(); const commissionAmount = conversionData.conversion_value * (partner?.commission_rate || 10) / 100; await supabase.from('partner_commissions').insert({ partner_id: referral.partner_id, referral_id: referralId, amount: commissionAmount, status: 'pending', created_at: new Date().toISOString() }); return { success: true, data: referral } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReferrals(partnerId: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('partner_referrals').select('*').eq('partner_id', partnerId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCommissions(partnerId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('partner_commissions').select('*, partner_referrals(*)').eq('partner_id', partnerId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPayout(partnerId: string, payoutData: { amount: number; payment_method: string; payment_details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_payouts').insert({ partner_id: partnerId, ...payoutData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('partner_commissions').update({ status: 'paid', payout_id: data.id }).eq('partner_id', partnerId).eq('status', 'approved'); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completePayout(payoutId: string, transactionId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('partner_payouts').update({ status: 'completed', transaction_id: transactionId, completed_at: new Date().toISOString() }).eq('id', payoutId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
