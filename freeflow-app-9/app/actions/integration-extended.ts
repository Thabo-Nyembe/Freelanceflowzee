'use server'

/**
 * Extended Integration Server Actions - Covers all 15 Integration-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getIntegrationApiKeys(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_api_keys').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createIntegrationApiKey(userId: string, integrationId: string, name: string) {
  try { const supabase = await createClient(); const apiKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`; const { data, error } = await supabase.from('integration_api_keys').insert({ user_id: userId, integration_id: integrationId, name, api_key: apiKey }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeIntegrationApiKey(keyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('integration_api_keys').delete().eq('id', keyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationConfig(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_config').select('*').eq('integration_id', integrationId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateIntegrationConfig(integrationId: string, config: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_config').upsert({ integration_id: integrationId, ...config }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationDependencies(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_dependencies').select('*').eq('integration_id', integrationId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getIntegrationHealthChecks(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_health_checks').select('*').eq('integration_id', integrationId).order('checked_at', { ascending: false }).limit(50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordIntegrationHealthCheck(integrationId: string, status: string, responseTime?: number, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_health_checks').insert({ integration_id: integrationId, status, response_time: responseTime, details, checked_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationMarketplace() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_marketplace').select('*').eq('is_published', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getIntegrationOauthTokens(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_oauth_tokens').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function storeIntegrationOauthToken(userId: string, integrationId: string, tokens: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_oauth_tokens').upsert({ user_id: userId, integration_id: integrationId, ...tokens }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeIntegrationOauthToken(userId: string, integrationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('integration_oauth_tokens').delete().eq('user_id', userId).eq('integration_id', integrationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationOnboardingProgress(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_onboarding_progress').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateIntegrationOnboardingProgress(userId: string, integrationId: string, step: string, completed: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_onboarding_progress').upsert({ user_id: userId, integration_id: integrationId, current_step: step, is_completed: completed }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_preferences').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateIntegrationPreferences(userId: string, preferences: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_preferences').upsert({ user_id: userId, ...preferences }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationRateLimits(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_rate_limits').select('*').eq('integration_id', integrationId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getIntegrationSetupErrors(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_errors').select('*').eq('session_id', sessionId).order('occurred_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logIntegrationSetupError(sessionId: string, errorCode: string, errorMessage: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_errors').insert({ session_id: sessionId, error_code: errorCode, error_message: errorMessage, details, occurred_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationSetupSessions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createIntegrationSetupSession(userId: string, integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_sessions').insert({ user_id: userId, integration_id: integrationId, status: 'in_progress', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeIntegrationSetupSession(sessionId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_sessions').update({ status, completed_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationSetupSteps(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_steps').select('*').eq('session_id', sessionId).order('step_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateIntegrationSetupStep(sessionId: string, stepOrder: number, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_setup_steps').update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('session_id', sessionId).eq('step_order', stepOrder).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationStats(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_stats').select('*').eq('integration_id', integrationId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrationTemplates() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_templates').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getIntegrationValidationResults(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_validation_results').select('*').eq('session_id', sessionId).order('validated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordIntegrationValidationResult(sessionId: string, validationType: string, isValid: boolean, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integration_validation_results').insert({ session_id: sessionId, validation_type: validationType, is_valid: isValid, details, validated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
