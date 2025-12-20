'use server'

/**
 * Extended Subscriptions Server Actions - Covers all Subscription-related tables
 * Tables: subscriptions, subscription_usage
 */

import { createClient } from '@/lib/supabase/server'

export async function getSubscription(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSubscription(subData: { user_id: string; plan_id: string; status?: string; billing_cycle?: string; start_date?: string; trial_end?: string; current_period_start?: string; current_period_end?: string; cancel_at_period_end?: boolean; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('subscriptions').insert({ ...subData, status: subData.status || 'active', billing_cycle: subData.billing_cycle || 'monthly', start_date: subData.start_date || now, current_period_start: subData.current_period_start || now, cancel_at_period_end: subData.cancel_at_period_end ?? false, created_at: now }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubscription(subscriptionId: string, updates: Partial<{ plan_id: string; status: string; billing_cycle: string; current_period_start: string; current_period_end: string; cancel_at_period_end: boolean; canceled_at: string; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelSubscription(subscriptionId: string, cancelImmediately?: boolean) {
  try { const supabase = await createClient(); const updates: any = { updated_at: new Date().toISOString() }; if (cancelImmediately) { updates.status = 'canceled'; updates.canceled_at = new Date().toISOString(); } else { updates.cancel_at_period_end = true; } const { data, error } = await supabase.from('subscriptions').update(updates).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reactivateSubscription(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').update({ cancel_at_period_end: false, status: 'active', updated_at: new Date().toISOString() }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserSubscription(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).in('status', ['active', 'trialing', 'past_due']).order('created_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserSubscriptions(userId: string, options?: { status?: string; includeAll?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('subscriptions').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); else if (!options?.includeAll) query = query.in('status', ['active', 'trialing', 'past_due', 'canceled']); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActiveSubscriptions(options?: { planId?: string; billingCycle?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('subscriptions').select('*, users(email, name)').in('status', ['active', 'trialing']); if (options?.planId) query = query.eq('plan_id', options.planId); if (options?.billingCycle) query = query.eq('billing_cycle', options.billingCycle); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubscriptionsEndingSoon(daysAhead?: number) {
  try { const supabase = await createClient(); const endDate = new Date(); endDate.setDate(endDate.getDate() + (daysAhead || 7)); const { data, error } = await supabase.from('subscriptions').select('*, users(email, name)').eq('status', 'active').eq('cancel_at_period_end', false).lte('current_period_end', endDate.toISOString()).gte('current_period_end', new Date().toISOString()).order('current_period_end', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordSubscriptionUsage(usageData: { subscription_id: string; feature: string; quantity: number; timestamp?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscription_usage').insert({ ...usageData, timestamp: usageData.timestamp || new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscriptionUsage(subscriptionId: string, options?: { feature?: string; startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('subscription_usage').select('*').eq('subscription_id', subscriptionId); if (options?.feature) query = query.eq('feature', options.feature); if (options?.startDate) query = query.gte('timestamp', options.startDate); if (options?.endDate) query = query.lte('timestamp', options.endDate); const { data, error } = await query.order('timestamp', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubscriptionUsageSummary(subscriptionId: string, feature?: string) {
  try { const supabase = await createClient(); let query = supabase.from('subscription_usage').select('feature, quantity').eq('subscription_id', subscriptionId); if (feature) query = query.eq('feature', feature); const { data } = await query; const summary: Record<string, number> = {}; data?.forEach(u => { summary[u.feature] = (summary[u.feature] || 0) + u.quantity; }); return { success: true, data: summary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkSubscriptionFeatureLimit(subscriptionId: string, feature: string, limit: number) {
  try { const supabase = await createClient(); const { data: sub } = await supabase.from('subscriptions').select('current_period_start, current_period_end').eq('id', subscriptionId).single(); if (!sub) return { success: false, error: 'Subscription not found' }; const { data: usage } = await supabase.from('subscription_usage').select('quantity').eq('subscription_id', subscriptionId).eq('feature', feature).gte('timestamp', sub.current_period_start).lte('timestamp', sub.current_period_end); const total = usage?.reduce((sum, u) => sum + u.quantity, 0) || 0; return { success: true, data: { used: total, limit, remaining: Math.max(0, limit - total), isWithinLimit: total < limit } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscriptionStats() {
  try { const supabase = await createClient(); const { data: all } = await supabase.from('subscriptions').select('status, plan_id, billing_cycle'); const stats = { total: all?.length || 0, byStatus: {} as Record<string, number>, byPlan: {} as Record<string, number>, byBillingCycle: {} as Record<string, number> }; all?.forEach(s => { stats.byStatus[s.status] = (stats.byStatus[s.status] || 0) + 1; stats.byPlan[s.plan_id] = (stats.byPlan[s.plan_id] || 0) + 1; stats.byBillingCycle[s.billing_cycle] = (stats.byBillingCycle[s.billing_cycle] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
