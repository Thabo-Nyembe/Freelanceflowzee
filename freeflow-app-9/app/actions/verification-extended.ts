'use server'

/**
 * Extended Verification Server Actions - Covers all Verification-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getVerifications(userId?: string, verificationType?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('verifications').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (verificationType) query = query.eq('verification_type', verificationType); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVerification(verificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('verifications').select('*').eq('id', verificationId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVerification(input: { user_id: string; verification_type: string; target: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('verifications').insert({ ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeVerification(verificationId: string, verifiedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('verifications').update({ status: 'verified', verified_at: new Date().toISOString(), verified_by: verifiedBy }).eq('id', verificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectVerification(verificationId: string, reason: string, rejectedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('verifications').update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date().toISOString(), rejected_by: rejectedBy }).eq('id', verificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function expireVerification(verificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('verifications').update({ status: 'expired', expired_at: new Date().toISOString() }).eq('id', verificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkUserVerificationStatus(userId: string, verificationType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('verifications').select('*').eq('user_id', userId).eq('verification_type', verificationType).eq('status', 'verified').single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: { isVerified: !!data, verification: data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVerificationCodes(userId?: string, codeType?: string, isUsed?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('verification_codes').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (codeType) query = query.eq('code_type', codeType); if (isUsed !== undefined) query = query.eq('is_used', isUsed); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function generateVerificationCode(userId: string, codeType: string, target: string, expiresInMinutes = 15) {
  try { const supabase = await createClient(); await supabase.from('verification_codes').update({ is_used: true }).eq('user_id', userId).eq('code_type', codeType).eq('is_used', false); const code = Math.floor(100000 + Math.random() * 900000).toString(); const expiresAt = new Date(); expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes); const { data, error } = await supabase.from('verification_codes').insert({ user_id: userId, code, code_type: codeType, target, expires_at: expiresAt.toISOString(), is_used: false, attempt_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyCode(userId: string, code: string, codeType: string) {
  try { const supabase = await createClient(); const { data: verificationCode, error } = await supabase.from('verification_codes').select('*').eq('user_id', userId).eq('code', code).eq('code_type', codeType).eq('is_used', false).single(); if (error) throw new Error('Invalid verification code'); if (new Date(verificationCode.expires_at) < new Date()) throw new Error('Verification code has expired'); if (verificationCode.attempt_count >= 5) throw new Error('Too many attempts'); const { data, error: updateError } = await supabase.from('verification_codes').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', verificationCode.id).select().single(); if (updateError) throw updateError; return { success: true, data: { verified: true, code: data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementCodeAttempt(codeId: string) {
  try { const supabase = await createClient(); const { data: code, error: codeError } = await supabase.from('verification_codes').select('attempt_count').eq('id', codeId).single(); if (codeError) throw codeError; const { data, error } = await supabase.from('verification_codes').update({ attempt_count: (code.attempt_count || 0) + 1 }).eq('id', codeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function invalidateVerificationCodes(userId: string, codeType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('verification_codes').update({ is_used: true }).eq('user_id', userId).eq('is_used', false); if (codeType) query = query.eq('code_type', codeType); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupExpiredCodes() {
  try { const supabase = await createClient(); const { error } = await supabase.from('verification_codes').delete().lt('expires_at', new Date().toISOString()).eq('is_used', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
