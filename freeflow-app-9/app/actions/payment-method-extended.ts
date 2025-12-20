'use server'

/**
 * Extended Payment Method Server Actions - Covers all Payment Method-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPaymentMethods(userId: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('payment_methods').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').select('*').eq('id', methodId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addPaymentMethod(input: { user_id: string; method_type: string; provider?: string; last_four?: string; brand?: string; exp_month?: number; exp_year?: number; billing_address_id?: string; metadata?: any; is_default?: boolean }) {
  try { const supabase = await createClient(); if (input.is_default) { await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', input.user_id); } const { data, error } = await supabase.from('payment_methods').insert({ ...input, is_active: true, is_verified: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePaymentMethod(methodId: string, updates: any) {
  try { const supabase = await createClient(); if (updates.is_default) { const { data: current } = await supabase.from('payment_methods').select('user_id').eq('id', methodId).single(); if (current) { await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', current.user_id); } } const { data, error } = await supabase.from('payment_methods').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', methodId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('payment_methods').delete().eq('id', methodId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultPaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { data: method, error: getError } = await supabase.from('payment_methods').select('user_id').eq('id', methodId).single(); if (getError) throw getError; await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', method.user_id); const { data, error } = await supabase.from('payment_methods').update({ is_default: true }).eq('id', methodId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaultPaymentMethod(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').select('*').eq('user_id', userId).eq('is_default', true).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyPaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', methodId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivatePaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').update({ is_active: false, is_default: false }).eq('id', methodId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentProviders(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('payment_providers').select('*').order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPaymentProvider(providerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_providers').select('*').eq('id', providerId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPaymentProvider(input: { name: string; code: string; description?: string; config?: any; supported_methods?: string[]; supported_currencies?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_providers').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePaymentProvider(providerId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_providers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', providerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
