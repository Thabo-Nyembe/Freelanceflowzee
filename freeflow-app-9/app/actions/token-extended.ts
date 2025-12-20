'use server'

/**
 * Extended Token Server Actions - Covers all Token-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTokens(userId?: string, tokenType?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('tokens').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (tokenType) query = query.eq('token_type', tokenType); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tokens').select('*').eq('id', tokenId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createToken(input: { user_id: string; token_type: string; name?: string; scopes?: string[]; expires_at?: string; metadata?: any }) {
  try { const supabase = await createClient(); const token = generateSecureToken(); const { data, error } = await supabase.from('tokens').insert({ ...input, token, is_active: true, last_used_at: null }).select().single(); if (error) throw error; return { success: true, data: { ...data, token } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateSecureToken(): string { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let token = ''; for (let i = 0; i < 64; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)); } return token; }

export async function updateToken(tokenId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tokens').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tokens').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteToken(tokenId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tokens').delete().eq('id', tokenId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateToken(token: string) {
  try { const supabase = await createClient(); const { data: tokenData, error } = await supabase.from('tokens').select('*').eq('token', token).single(); if (error) throw new Error('Invalid token'); if (!tokenData.is_active) throw new Error('Token is revoked'); if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) throw new Error('Token has expired'); await supabase.from('tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenData.id); return { success: true, data: { valid: true, token: tokenData } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function refreshToken(tokenId: string, expiresAt?: string) {
  try { const supabase = await createClient(); const newToken = generateSecureToken(); const { data, error } = await supabase.from('tokens').update({ token: newToken, expires_at: expiresAt, refreshed_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data: { ...data, token: newToken } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeAllUserTokens(userId: string, tokenType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('tokens').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true); if (tokenType) query = query.eq('token_type', tokenType); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTokenUsage(userId?: string, tokenId?: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('token_usage').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (tokenId) query = query.eq('token_id', tokenId); if (startDate) query = query.gte('created_at', startDate); if (endDate) query = query.lte('created_at', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordTokenUsage(input: { token_id: string; user_id: string; action: string; resource?: string; tokens_used?: number; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('token_usage').insert({ ...input, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTokenUsageSummary(userId: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('token_usage').select('action, tokens_used').eq('user_id', userId); if (startDate) query = query.gte('created_at', startDate); if (endDate) query = query.lte('created_at', endDate); const { data, error } = await query; if (error) throw error; const totalTokens = data?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0; const actionCounts: Record<string, number> = {}; data?.forEach(u => { actionCounts[u.action] = (actionCounts[u.action] || 0) + 1; }); return { success: true, data: { total_usage: data?.length || 0, total_tokens: totalTokens, action_breakdown: actionCounts } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupExpiredTokens() {
  try { const supabase = await createClient(); const { error } = await supabase.from('tokens').update({ is_active: false }).lt('expires_at', new Date().toISOString()).eq('is_active', true); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
