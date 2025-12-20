'use server'

/**
 * Extended Vendors Server Actions
 * Tables: vendors, vendor_contracts, vendor_payments, vendor_products
 */

import { createClient } from '@/lib/supabase/server'

export async function getVendor(vendorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendors').select('*').eq('id', vendorId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVendor(vendorData: { user_id: string; name: string; email?: string; phone?: string; address?: string; type?: string; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendors').insert({ ...vendorData, status: vendorData.status || 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVendor(vendorId: string, updates: Partial<{ name: string; email: string; phone: string; address: string; type: string; status: string; rating: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', vendorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteVendor(vendorId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('vendors').delete().eq('id', vendorId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVendors(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('vendors').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVendorContracts(vendorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendor_contracts').select('*').eq('vendor_id', vendorId).order('start_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVendorContract(contractData: { vendor_id: string; title: string; start_date: string; end_date?: string; value?: number; terms?: string; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendor_contracts').insert({ ...contractData, status: contractData.status || 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVendorPayments(vendorId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('vendor_payments').select('*').eq('vendor_id', vendorId); if (options?.date_from) query = query.gte('payment_date', options.date_from); if (options?.date_to) query = query.lte('payment_date', options.date_to); const { data, error } = await query.order('payment_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVendorPayment(paymentData: { vendor_id: string; amount: number; payment_date: string; invoice_id?: string; method?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendor_payments').insert({ ...paymentData, status: 'completed', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVendorProducts(vendorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vendor_products').select('*').eq('vendor_id', vendorId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
