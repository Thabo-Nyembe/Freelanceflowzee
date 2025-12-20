'use server'

/**
 * Extended Password Server Actions - Covers all Password-related tables
 * Tables: password_history, password_reset_tokens
 */

import { createClient } from '@/lib/supabase/server'

export async function getPasswordHistory(userId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_history').select('id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPasswordToHistory(userId: string, passwordHash: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_history').insert({ user_id: userId, password_hash: passwordHash, created_at: new Date().toISOString() }).select('id, created_at').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkPasswordInHistory(userId: string, passwordHash: string, historyCount?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_history').select('password_hash').eq('user_id', userId).order('created_at', { ascending: false }).limit(historyCount || 5); if (error) throw error; const exists = data?.some(entry => entry.password_hash === passwordHash) || false; return { success: true, exists } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupOldPasswordHistory(userId: string, keepCount?: number) {
  try { const supabase = await createClient(); const { data: all } = await supabase.from('password_history').select('id').eq('user_id', userId).order('created_at', { ascending: false }); if (all && all.length > (keepCount || 10)) { const toDelete = all.slice(keepCount || 10).map(p => p.id); await supabase.from('password_history').delete().in('id', toDelete); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPasswordResetToken(userId: string, email: string, expiresInHours?: number) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const expiresAt = new Date(Date.now() + (expiresInHours || 24) * 60 * 60 * 1000).toISOString(); await supabase.from('password_reset_tokens').update({ is_used: true }).eq('user_id', userId).eq('is_used', false); const { data, error } = await supabase.from('password_reset_tokens').insert({ user_id: userId, email, token, expires_at: expiresAt, is_used: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { token, expiresAt } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validatePasswordResetToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_reset_tokens').select('*').eq('token', token).eq('is_used', false).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid or expired token' }; if (new Date(data.expires_at) < new Date()) return { success: false, error: 'Token has expired' }; return { success: true, data: { userId: data.user_id, email: data.email } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function usePasswordResetToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_reset_tokens').update({ is_used: true, used_at: new Date().toISOString() }).eq('token', token).eq('is_used', false).select().single(); if (error) throw error; if (!data) return { success: false, error: 'Token already used or invalid' }; return { success: true, data: { userId: data.user_id } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteExpiredPasswordResetTokens() {
  try { const supabase = await createClient(); const { error } = await supabase.from('password_reset_tokens').delete().lt('expires_at', new Date().toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPasswordResetTokensByUser(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('password_reset_tokens').select('id, email, created_at, expires_at, is_used, used_at').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
