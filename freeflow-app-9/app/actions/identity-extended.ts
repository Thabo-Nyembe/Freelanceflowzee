'use server'

/**
 * Extended Identity Server Actions
 * Tables: identity_verifications, identity_documents, identity_providers, identity_sessions, identity_mfa
 */

import { createClient } from '@/lib/supabase/server'

export async function getIdentityVerification(verificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_verifications').select('*, identity_documents(*)').eq('id', verificationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createIdentityVerification(verificationData: { user_id: string; type: string; provider?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_verifications').insert({ ...verificationData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateIdentityVerification(verificationId: string, updates: Partial<{ status: string; verified_at: string; rejection_reason: string; verification_data: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_verifications').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', verificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserVerifications(userId: string, options?: { type?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('identity_verifications').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function uploadIdentityDocument(documentData: { verification_id: string; user_id: string; document_type: string; file_url: string; file_name: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_documents').insert({ ...documentData, status: 'pending', uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocumentStatus(documentId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_documents').update({ status, notes, reviewed_at: new Date().toISOString() }).eq('id', documentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVerificationDocuments(verificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_documents').select('*').eq('verification_id', verificationId).order('uploaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getIdentityProviders(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('identity_providers').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createIdentitySession(sessionData: { user_id: string; provider_id?: string; ip_address?: string; user_agent?: string; device_info?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_sessions').insert({ ...sessionData, is_active: true, started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endIdentitySession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveSessions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_sessions').select('*').eq('user_id', userId).eq('is_active', true).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setupMFA(mfaData: { user_id: string; method: string; secret?: string; phone_number?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_mfa').insert({ ...mfaData, is_enabled: false, is_verified: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyMFA(mfaId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_mfa').update({ is_enabled: true, is_verified: true, verified_at: new Date().toISOString() }).eq('id', mfaId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disableMFA(userId: string, method: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('identity_mfa').update({ is_enabled: false, disabled_at: new Date().toISOString() }).eq('user_id', userId).eq('method', method); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserMFAMethods(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('identity_mfa').select('*').eq('user_id', userId).eq('is_enabled', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
