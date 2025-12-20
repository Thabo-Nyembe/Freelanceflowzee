'use server'

/**
 * Extended OAuth Server Actions - Covers all 7 OAuth-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getOAuthAccessTokens(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_access_tokens').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createOAuthAccessToken(userId: string, applicationId: string, scopes: string[], expiresAt: string) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('oauth_access_tokens').insert({ user_id: userId, application_id: applicationId, token, scopes, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeOAuthAccessToken(tokenId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('oauth_access_tokens').delete().eq('id', tokenId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOAuthApplications(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('oauth_applications').select('*').order('name', { ascending: true }); if (userId) query = query.eq('owner_id', userId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createOAuthApplication(userId: string, input: { name: string; description?: string; redirect_uris: string[]; scopes?: string[] }) {
  try { const supabase = await createClient(); const clientId = crypto.randomUUID(); const clientSecret = crypto.randomUUID(); const { data, error } = await supabase.from('oauth_applications').insert({ owner_id: userId, client_id: clientId, client_secret: clientSecret, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOAuthApplication(applicationId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_applications').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', applicationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOAuthApplication(applicationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('oauth_applications').delete().eq('id', applicationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOAuthAuthorizationCodes(applicationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_authorization_codes').select('*').eq('application_id', applicationId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createOAuthAuthorizationCode(userId: string, applicationId: string, redirectUri: string, scopes: string[]) {
  try { const supabase = await createClient(); const code = crypto.randomUUID(); const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); const { data, error } = await supabase.from('oauth_authorization_codes').insert({ user_id: userId, application_id: applicationId, code, redirect_uri: redirectUri, scopes, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exchangeOAuthAuthorizationCode(code: string) {
  try { const supabase = await createClient(); const { data: authCode, error: authError } = await supabase.from('oauth_authorization_codes').select('*').eq('code', code).single(); if (authError) throw authError; if (new Date(authCode.expires_at) < new Date()) throw new Error('Code expired'); await supabase.from('oauth_authorization_codes').delete().eq('id', authCode.id); return { success: true, data: authCode } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOAuthRefreshTokens(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_refresh_tokens').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createOAuthRefreshToken(userId: string, applicationId: string, accessTokenId: string) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); const { data, error } = await supabase.from('oauth_refresh_tokens').insert({ user_id: userId, application_id: applicationId, access_token_id: accessTokenId, token, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeOAuthRefreshToken(tokenId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('oauth_refresh_tokens').delete().eq('id', tokenId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOAuthScopes() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_scopes').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createOAuthScope(input: { name: string; description: string; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_scopes').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOAuthUserAuthorizations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_user_authorizations').select('*').eq('user_id', userId).order('authorized_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function authorizeOAuthApplication(userId: string, applicationId: string, scopes: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_user_authorizations').upsert({ user_id: userId, application_id: applicationId, scopes, authorized_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeOAuthUserAuthorization(userId: string, applicationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('oauth_user_authorizations').delete().eq('user_id', userId).eq('application_id', applicationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOAuthUserProfile(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_user_profiles').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOAuthUserProfile(userId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('oauth_user_profiles').upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
