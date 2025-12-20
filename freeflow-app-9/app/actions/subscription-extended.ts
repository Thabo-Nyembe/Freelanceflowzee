'use server'

/**
 * Extended Subscription Server Actions - Covers all Subscription-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSubscriptions(userId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('subscriptions').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubscription(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserActiveSubscription(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').select('*, subscription_plans(*)').eq('user_id', userId).eq('status', 'active').single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSubscription(input: { user_id: string; plan_id: string; payment_method_id?: string; billing_cycle: string; trial_ends_at?: string }) {
  try { const supabase = await createClient(); const { data: plan, error: planError } = await supabase.from('subscription_plans').select('*').eq('id', input.plan_id).single(); if (planError) throw planError; const now = new Date(); const periodEnd = new Date(now); if (input.billing_cycle === 'monthly') { periodEnd.setMonth(periodEnd.getMonth() + 1); } else if (input.billing_cycle === 'yearly') { periodEnd.setFullYear(periodEnd.getFullYear() + 1); } const { data, error } = await supabase.from('subscriptions').insert({ ...input, status: input.trial_ends_at ? 'trialing' : 'active', current_period_start: now.toISOString(), current_period_end: periodEnd.toISOString(), price: plan.price }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubscription(subscriptionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true, reason?: string) {
  try { const supabase = await createClient(); const updates: any = { cancellation_reason: reason, cancelled_at: new Date().toISOString() }; if (cancelAtPeriodEnd) { updates.cancel_at_period_end = true; } else { updates.status = 'cancelled'; } const { data, error } = await supabase.from('subscriptions').update(updates).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reactivateSubscription(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').update({ status: 'active', cancel_at_period_end: false, cancelled_at: null, cancellation_reason: null }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pauseSubscription(subscriptionId: string, resumeAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').update({ status: 'paused', paused_at: new Date().toISOString(), resume_at: resumeAt }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resumeSubscription(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriptions').update({ status: 'active', paused_at: null, resume_at: null }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function changeSubscriptionPlan(subscriptionId: string, newPlanId: string, prorated = true) {
  try { const supabase = await createClient(); const { data: newPlan, error: planError } = await supabase.from('subscription_plans').select('*').eq('id', newPlanId).single(); if (planError) throw planError; const { data, error } = await supabase.from('subscriptions').update({ plan_id: newPlanId, price: newPlan.price, upgraded_at: new Date().toISOString(), proration_behavior: prorated ? 'create_prorations' : 'none' }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscriptionPlans(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('subscription_plans').select('*').order('price', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubscriptionPlan(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscription_plans').select('*').eq('id', planId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSubscriptionPlan(input: { name: string; description?: string; price: number; billing_interval: string; features?: string[]; limits?: any; trial_days?: number; is_popular?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscription_plans').insert({ ...input, is_active: true, subscriber_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubscriptionPlan(planId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscription_plans').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', planId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSubscriptionPlan(planId: string) {
  try { const supabase = await createClient(); const { count } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_id', planId).eq('status', 'active'); if (count && count > 0) throw new Error('Cannot delete plan with active subscribers'); const { error } = await supabase.from('subscription_plans').delete().eq('id', planId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
