'use server'

/**
 * Extended Tokens Server Actions
 * Tables: tokens, token_usages, token_revocations, token_scopes, token_refresh_history, token_audit_logs
 */

import { createClient } from '@/lib/supabase/server'
import { randomBytes, createHash } from 'crypto'

export async function getToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tokens').select('*, token_scopes(*), token_usages(*)').eq('id', tokenId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createToken(tokenData: { name: string; token_type: string; owner_id: string; owner_type?: string; scopes?: string[]; expires_at?: string; rate_limit?: number; metadata?: any }) {
  try { const supabase = await createClient(); const rawToken = generateSecureToken(); const tokenHash = hashToken(rawToken); const prefix = rawToken.substring(0, 8); const { data: token, error: tokenError } = await supabase.from('tokens').insert({ name: tokenData.name, token_type: tokenData.token_type, owner_id: tokenData.owner_id, owner_type: tokenData.owner_type || 'user', token_hash: tokenHash, token_prefix: prefix, expires_at: tokenData.expires_at, rate_limit: tokenData.rate_limit, status: 'active', usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (tokenError) throw tokenError; if (tokenData.scopes && tokenData.scopes.length > 0) { const scopeRecords = tokenData.scopes.map(scope => ({ token_id: token.id, scope, created_at: new Date().toISOString() })); await supabase.from('token_scopes').insert(scopeRecords) } await logAudit(token.id, 'created', { token_type: tokenData.token_type }, tokenData.owner_id); return { success: true, data: { ...token, rawToken } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function updateToken(tokenId: string, updates: Partial<{ name: string; expires_at: string; rate_limit: number; status: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tokens').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; await logAudit(tokenId, 'updated', updates); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteToken(tokenId: string, deletedBy?: string) {
  try { const supabase = await createClient(); await supabase.from('token_scopes').delete().eq('token_id', tokenId); await supabase.from('token_usages').delete().eq('token_id', tokenId); await logAudit(tokenId, 'deleted', {}, deletedBy); const { error } = await supabase.from('tokens').delete().eq('id', tokenId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTokens(options?: { token_type?: string; owner_id?: string; owner_type?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tokens').select('*, token_scopes(*)'); if (options?.token_type) query = query.eq('token_type', options.token_type); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.owner_type) query = query.eq('owner_type', options.owner_type); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function validateToken(rawToken: string) {
  try { const supabase = await createClient(); const tokenHash = hashToken(rawToken); const { data: token } = await supabase.from('tokens').select('*, token_scopes(*)').eq('token_hash', tokenHash).eq('status', 'active').single(); if (!token) return { success: true, data: { valid: false, reason: 'Token not found or inactive' } }; if (token.expires_at && new Date(token.expires_at) < new Date()) { await supabase.from('tokens').update({ status: 'expired' }).eq('id', token.id); return { success: true, data: { valid: false, reason: 'Token expired' } } } await recordUsage(token.id); return { success: true, data: { valid: true, token: { id: token.id, name: token.name, token_type: token.token_type, owner_id: token.owner_id, scopes: token.token_scopes?.map((s: any) => s.scope) || [] } } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recordUsage(tokenId: string, metadata?: any) {
  const supabase = await createClient()
  await supabase.from('token_usages').insert({ token_id: tokenId, used_at: new Date().toISOString(), metadata, created_at: new Date().toISOString() })
  await supabase.from('tokens').update({ usage_count: supabase.rpc('increment_count', { row_id: tokenId, count_column: 'usage_count' }), last_used_at: new Date().toISOString() }).eq('id', tokenId)
}

export async function revokeToken(tokenId: string, reason?: string, revokedBy?: string) {
  try { const supabase = await createClient(); await supabase.from('token_revocations').insert({ token_id: tokenId, reason, revoked_by: revokedBy, revoked_at: new Date().toISOString(), created_at: new Date().toISOString() }); const { data, error } = await supabase.from('tokens').update({ status: 'revoked', revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; await logAudit(tokenId, 'revoked', { reason }, revokedBy); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function refreshToken(tokenId: string, newExpiresAt?: string) {
  try { const supabase = await createClient(); const { data: oldToken } = await supabase.from('tokens').select('*').eq('id', tokenId).single(); if (!oldToken) return { success: false, error: 'Token not found' }; if (oldToken.status !== 'active') return { success: false, error: 'Token is not active' }; const rawToken = generateSecureToken(); const tokenHash = hashToken(rawToken); const prefix = rawToken.substring(0, 8); await supabase.from('token_refresh_history').insert({ token_id: tokenId, old_token_hash: oldToken.token_hash, new_token_hash: tokenHash, refreshed_at: new Date().toISOString(), created_at: new Date().toISOString() }); const { data, error } = await supabase.from('tokens').update({ token_hash: tokenHash, token_prefix: prefix, expires_at: newExpiresAt || oldToken.expires_at, refreshed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; await logAudit(tokenId, 'refreshed', {}); return { success: true, data: { ...data, rawToken } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateScopes(tokenId: string, scopes: string[]) {
  try { const supabase = await createClient(); await supabase.from('token_scopes').delete().eq('token_id', tokenId); if (scopes.length > 0) { const scopeRecords = scopes.map(scope => ({ token_id: tokenId, scope, created_at: new Date().toISOString() })); await supabase.from('token_scopes').insert(scopeRecords) } await logAudit(tokenId, 'scopes_updated', { scopes }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUsageHistory(tokenId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('token_usages').select('*').eq('token_id', tokenId); if (options?.from_date) query = query.gte('used_at', options.from_date); if (options?.to_date) query = query.lte('used_at', options.to_date); const { data, error } = await query.order('used_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

async function logAudit(tokenId: string, action: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('token_audit_logs').insert({ token_id: tokenId, action, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getAuditLogs(tokenId: string, options?: { action?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('token_audit_logs').select('*, users(*)').eq('token_id', tokenId); if (options?.action) query = query.eq('action', options.action); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkRateLimit(tokenId: string) {
  try { const supabase = await createClient(); const { data: token } = await supabase.from('tokens').select('rate_limit').eq('id', tokenId).single(); if (!token?.rate_limit) return { success: true, data: { withinLimit: true, unlimited: true } }; const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString(); const { count } = await supabase.from('token_usages').select('*', { count: 'exact', head: true }).eq('token_id', tokenId).gte('used_at', oneHourAgo); return { success: true, data: { withinLimit: (count || 0) < token.rate_limit, limit: token.rate_limit, current: count || 0, remaining: Math.max(0, token.rate_limit - (count || 0)) } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupExpiredTokens() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tokens').update({ status: 'expired', updated_at: new Date().toISOString() }).lt('expires_at', new Date().toISOString()).eq('status', 'active').select('id'); if (error) throw error; return { success: true, data: { expiredCount: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
