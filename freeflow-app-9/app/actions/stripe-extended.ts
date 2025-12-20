'use server'

/**
 * Extended Stripe Server Actions
 * Tables: stripe_customers, stripe_subscriptions, stripe_invoices, stripe_payments
 */

import { createClient } from '@/lib/supabase/server'

export async function getStripeCustomer(customerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stripe_customers').select('*').eq('id', customerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStripeCustomerByUserId(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stripe_customers').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStripeCustomer(customerData: { user_id: string; stripe_customer_id: string; email?: string; name?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stripe_customers').insert({ ...customerData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStripeSubscriptions(options?: { customer_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stripe_subscriptions').select('*'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStripeSubscription(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stripe_subscriptions').select('*').eq('id', subscriptionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStripeInvoices(options?: { customer_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stripe_invoices').select('*'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStripePayments(options?: { customer_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stripe_payments').select('*'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordStripePayment(paymentData: { customer_id: string; stripe_payment_id: string; amount: number; currency: string; status: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stripe_payments').insert({ ...paymentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
