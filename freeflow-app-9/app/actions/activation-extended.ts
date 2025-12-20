'use server'

/**
 * Extended Activation Server Actions - Covers all Activation-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getActivations(userId?: string, productId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('activations').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (productId) query = query.eq('product_id', productId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActivation(activationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activations').select('*').eq('id', activationId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createActivation(input: { user_id: string; product_id: string; license_id?: string; device_id: string; device_name?: string; device_info?: any; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activations').insert({ ...input, status: 'active', activated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateActivation(activationId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activations').update({ status: 'deactivated', deactivated_at: new Date().toISOString(), deactivation_reason: reason }).eq('id', activationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateActivationHeartbeat(activationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activations').update({ last_seen_at: new Date().toISOString() }).eq('id', activationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveDeviceCount(userId: string, productId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('activations').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('product_id', productId).eq('status', 'active'); if (error) throw error; return { success: true, data: { count: count || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActivationCodes(isUsed?: boolean, productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('activation_codes').select('*').order('created_at', { ascending: false }); if (isUsed !== undefined) query = query.eq('is_used', isUsed); if (productId) query = query.eq('product_id', productId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function generateActivationCode(productId: string, expiresAt?: string, maxUses = 1) {
  try { const supabase = await createClient(); const code = generateCode(); const { data, error } = await supabase.from('activation_codes').insert({ code, product_id: productId, expires_at: expiresAt, max_uses: maxUses, use_count: 0, is_used: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateCode(): string { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let code = ''; for (let i = 0; i < 16; i++) { if (i > 0 && i % 4 === 0) code += '-'; code += chars.charAt(Math.floor(Math.random() * chars.length)); } return code; }

export async function validateActivationCode(code: string) {
  try { const supabase = await createClient(); const { data: activationCode, error } = await supabase.from('activation_codes').select('*').eq('code', code).single(); if (error) throw error; if (activationCode.is_used && activationCode.use_count >= activationCode.max_uses) throw new Error('Code has been fully used'); if (activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) throw new Error('Code has expired'); return { success: true, data: { valid: true, code: activationCode } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function redeemActivationCode(code: string, userId: string) {
  try { const supabase = await createClient(); const validation = await validateActivationCode(code); if (!validation.success) throw new Error(validation.error); const activationCode = validation.data!.code; const newUseCount = (activationCode.use_count || 0) + 1; const { data, error } = await supabase.from('activation_codes').update({ use_count: newUseCount, is_used: newUseCount >= activationCode.max_uses, last_used_at: new Date().toISOString(), last_used_by: userId }).eq('id', activationCode.id).select().single(); if (error) throw error; return { success: true, data: { code: data, product_id: activationCode.product_id } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeActivationCode(codeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activation_codes').update({ is_used: true, revoked_at: new Date().toISOString() }).eq('id', codeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteActivationCode(codeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('activation_codes').delete().eq('id', codeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function generateBulkActivationCodes(productId: string, count: number, expiresAt?: string, maxUses = 1) {
  try { const supabase = await createClient(); const codes = []; for (let i = 0; i < count; i++) { codes.push({ code: generateCode(), product_id: productId, expires_at: expiresAt, max_uses: maxUses, use_count: 0, is_used: false }); } const { data, error } = await supabase.from('activation_codes').insert(codes).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
