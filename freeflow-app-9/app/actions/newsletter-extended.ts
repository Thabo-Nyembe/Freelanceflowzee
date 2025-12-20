'use server'

/**
 * Extended Newsletter Server Actions
 * Tables: newsletters, newsletter_subscribers, newsletter_campaigns, newsletter_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getNewsletter(newsletterId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').select('*').eq('id', newsletterId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createNewsletter(newsletterData: { user_id: string; name: string; subject: string; content: string; template_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').insert({ ...newsletterData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNewsletter(newsletterId: string, updates: Partial<{ name: string; subject: string; content: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', newsletterId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteNewsletter(newsletterId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('newsletters').delete().eq('id', newsletterId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNewsletters(options?: { user_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('newsletters').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendNewsletter(newsletterId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').update({ status: 'sending', sent_at: new Date().toISOString() }).eq('id', newsletterId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNewsletterSubscribers(options?: { user_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('newsletter_subscribers').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('subscribed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function subscribeToNewsletter(email: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_subscribers').insert({ email, user_id: userId, status: 'active', subscribed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribeFromNewsletter(email: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_subscribers').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('email', email).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNewsletterAnalytics(newsletterId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_analytics').select('*').eq('newsletter_id', newsletterId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
