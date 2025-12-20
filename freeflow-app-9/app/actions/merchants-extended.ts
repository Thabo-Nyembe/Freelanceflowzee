'use server'

/**
 * Extended Merchants Server Actions
 * Tables: merchants, merchant_accounts, merchant_products, merchant_orders, merchant_payouts, merchant_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getMerchant(merchantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchants').select('*, merchant_accounts(*), merchant_settings(*)').eq('id', merchantId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMerchant(merchantData: { name: string; user_id: string; business_type?: string; description?: string; logo_url?: string; website_url?: string; contact_email?: string; contact_phone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchants').insert({ ...merchantData, status: 'pending', verification_status: 'unverified', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMerchant(merchantId: string, updates: Partial<{ name: string; description: string; logo_url: string; website_url: string; contact_email: string; contact_phone: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchants').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', merchantId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyMerchant(merchantId: string, verificationData: { verified_by: string; verification_notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchants').update({ verification_status: 'verified', verified_at: new Date().toISOString(), verified_by: verificationData.verified_by, verification_notes: verificationData.verification_notes, status: 'active', updated_at: new Date().toISOString() }).eq('id', merchantId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMerchants(options?: { status?: string; verification_status?: string; business_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('merchants').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.verification_status) query = query.eq('verification_status', options.verification_status); if (options?.business_type) query = query.eq('business_type', options.business_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAccount(accountData: { merchant_id: string; account_type: string; account_name: string; account_number?: string; routing_number?: string; bank_name?: string; currency?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_accounts').insert({ ...accountData, status: 'pending', is_primary: false, currency: accountData.currency || 'USD', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyAccount(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_accounts').update({ status: 'verified', verified_at: new Date().toISOString() }).eq('id', accountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccounts(merchantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_accounts').select('*').eq('merchant_id', merchantId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProduct(productData: { merchant_id: string; name: string; description?: string; price: number; category?: string; sku?: string; inventory_count?: number; images?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_products').insert({ ...productData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProduct(productId: string, updates: Partial<{ name: string; description: string; price: number; category: string; inventory_count: number; status: string; images: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', productId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProducts(merchantId: string, options?: { status?: string; category?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('merchant_products').select('*').eq('merchant_id', merchantId); if (options?.status) query = query.eq('status', options.status); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOrders(merchantId: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('merchant_orders').select('*').eq('merchant_id', merchantId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_orders').update({ status, status_notes: notes, updated_at: new Date().toISOString() }).eq('id', orderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPayout(payoutData: { merchant_id: string; account_id: string; amount: number; currency?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('merchant_payouts').insert({ ...payoutData, status: 'pending', currency: payoutData.currency || 'USD', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPayouts(merchantId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('merchant_payouts').select('*, merchant_accounts(*)').eq('merchant_id', merchantId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(merchantId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('merchant_settings').select('id').eq('merchant_id', merchantId).single(); if (existing) { const { data, error } = await supabase.from('merchant_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('merchant_id', merchantId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('merchant_settings').insert({ merchant_id: merchantId, ...settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
