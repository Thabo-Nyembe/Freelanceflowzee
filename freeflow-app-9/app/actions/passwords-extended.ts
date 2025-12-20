'use server'

/**
 * Extended Passwords Server Actions
 * Tables: password_resets, password_history, password_policies, password_requirements
 */

import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(email: string) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); await supabase.from('password_resets').update({ status: 'expired' }).eq('email', email).eq('status', 'pending'); const { data, error } = await supabase.from('password_resets').insert({ email, token, expires_at: expiresAt, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { token } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateResetToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_resets').select('*').eq('token', token).eq('status', 'pending').single(); if (error || !data) return { success: false, error: 'Invalid or expired token' }; if (new Date(data.expires_at) < new Date()) { await supabase.from('password_resets').update({ status: 'expired' }).eq('id', data.id); return { success: false, error: 'Token has expired' } } return { success: true, data: { email: data.email } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completePasswordReset(token: string, newPassword: string) {
  try { const supabase = await createClient(); const { data: resetData, error: resetError } = await supabase.from('password_resets').select('*').eq('token', token).eq('status', 'pending').single(); if (resetError || !resetData) return { success: false, error: 'Invalid or expired token' }; if (new Date(resetData.expires_at) < new Date()) return { success: false, error: 'Token has expired' }; const { data: history } = await supabase.from('password_history').select('password_hash').eq('user_id', resetData.user_id).order('created_at', { ascending: false }).limit(5); await supabase.from('password_resets').update({ status: 'used', used_at: new Date().toISOString() }).eq('id', resetData.id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addToHistory(userId: string, passwordHash: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_history').insert({ user_id: userId, password_hash: passwordHash, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: oldHistory } = await supabase.from('password_history').select('id').eq('user_id', userId).order('created_at', { ascending: false }); if (oldHistory && oldHistory.length > 10) { const toDelete = oldHistory.slice(10).map(h => h.id); await supabase.from('password_history').delete().in('id', toDelete) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHistory(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_history').select('id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPolicy(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('password_policies').select('*'); if (organizationId) query = query.eq('organization_id', organizationId); else query = query.is('organization_id', null); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || { min_length: 8, require_uppercase: true, require_lowercase: true, require_number: true, require_special: false, max_age_days: 90, history_count: 5 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPolicy(policyData: { min_length?: number; max_length?: number; require_uppercase?: boolean; require_lowercase?: boolean; require_number?: boolean; require_special?: boolean; max_age_days?: number; history_count?: number; organization_id?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('password_policies').select('id').eq('organization_id', policyData.organization_id || null).single(); if (existing) { const { data, error } = await supabase.from('password_policies').update({ ...policyData, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('password_policies').insert({ ...policyData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validatePassword(password: string, organizationId?: string): Promise<{ success: boolean; errors?: string[] }> {
  const policyResult = await getPolicy(organizationId)
  const policy = policyResult.data
  const errors: string[] = []
  if (password.length < (policy?.min_length || 8)) errors.push(`Password must be at least ${policy?.min_length || 8} characters`)
  if (policy?.max_length && password.length > policy.max_length) errors.push(`Password must be at most ${policy.max_length} characters`)
  if (policy?.require_uppercase && !/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
  if (policy?.require_lowercase && !/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter')
  if (policy?.require_number && !/[0-9]/.test(password)) errors.push('Password must contain at least one number')
  if (policy?.require_special && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character')
  return errors.length > 0 ? { success: false, errors } : { success: true }
}

export async function getPendingResets(options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_resets').select('*').eq('status', 'pending').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function expireOldResets() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_resets').update({ status: 'expired' }).eq('status', 'pending').lt('expires_at', new Date().toISOString()).select(); if (error) throw error; return { success: true, data: { expired: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequirements(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('password_requirements').select('*'); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
