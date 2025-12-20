'use server'

/**
 * Extended Plans Server Actions
 * Tables: plans, plan_features, plan_limits, plan_pricing, plan_subscriptions, plan_usage
 */

import { createClient } from '@/lib/supabase/server'

export async function getPlan(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)').eq('id', planId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlanBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)').eq('slug', slug).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPlan(planData: { name: string; slug: string; description?: string; tier: number; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').insert({ ...planData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlan(planId: string, updates: Partial<{ name: string; description: string; tier: number; is_active: boolean; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', planId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePlan(planId: string) {
  try { const supabase = await createClient(); await supabase.from('plan_features').delete().eq('plan_id', planId); await supabase.from('plan_limits').delete().eq('plan_id', planId); await supabase.from('plan_pricing').delete().eq('plan_id', planId); const { error } = await supabase.from('plans').delete().eq('id', planId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlans(options?: { is_active?: boolean; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('tier', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFeature(planId: string, featureData: { feature_key: string; feature_name: string; description?: string; is_enabled: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_features').insert({ plan_id: planId, ...featureData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFeature(featureId: string, updates: Partial<{ feature_name: string; description: string; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_features').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', featureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatures(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_features').select('*').eq('plan_id', planId).order('feature_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setLimit(planId: string, limitData: { limit_key: string; limit_name: string; limit_value: number; limit_type?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('plan_limits').select('id').eq('plan_id', planId).eq('limit_key', limitData.limit_key).single(); if (existing) { const { data, error } = await supabase.from('plan_limits').update({ limit_value: limitData.limit_value, limit_name: limitData.limit_name, limit_type: limitData.limit_type, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('plan_limits').insert({ plan_id: planId, ...limitData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLimits(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_limits').select('*').eq('plan_id', planId).order('limit_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setPricing(planId: string, pricingData: { interval: string; amount: number; currency: string; stripe_price_id?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('plan_pricing').select('id').eq('plan_id', planId).eq('interval', pricingData.interval).eq('currency', pricingData.currency).single(); if (existing) { const { data, error } = await supabase.from('plan_pricing').update({ amount: pricingData.amount, stripe_price_id: pricingData.stripe_price_id, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('plan_pricing').insert({ plan_id: planId, ...pricingData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPricing(planId: string, options?: { interval?: string; currency?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('plan_pricing').select('*').eq('plan_id', planId).eq('is_active', true); if (options?.interval) query = query.eq('interval', options.interval); if (options?.currency) query = query.eq('currency', options.currency); const { data, error } = await query.order('interval', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSubscription(subscriptionData: { user_id?: string; organization_id?: string; plan_id: string; pricing_id: string; status?: string; stripe_subscription_id?: string }) {
  try { const supabase = await createClient(); const { data: pricing } = await supabase.from('plan_pricing').select('interval').eq('id', subscriptionData.pricing_id).single(); const startDate = new Date(); let endDate = new Date(startDate); if (pricing?.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1); else if (pricing?.interval === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1); const { data, error } = await supabase.from('plan_subscriptions').insert({ ...subscriptionData, status: subscriptionData.status || 'active', start_date: startDate.toISOString(), end_date: endDate.toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelSubscription(subscriptionId: string, cancelAtEnd?: boolean) {
  try { const supabase = await createClient(); const updates: any = { updated_at: new Date().toISOString() }; if (cancelAtEnd) { updates.cancel_at_period_end = true } else { updates.status = 'cancelled'; updates.cancelled_at = new Date().toISOString() } const { data, error } = await supabase.from('plan_subscriptions').update(updates).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordUsage(subscriptionId: string, usageData: { limit_key: string; quantity: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_usage').insert({ subscription_id: subscriptionId, ...usageData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUsage(subscriptionId: string, options?: { limit_key?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('plan_usage').select('*').eq('subscription_id', subscriptionId); if (options?.limit_key) query = query.eq('limit_key', options.limit_key); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkLimit(subscriptionId: string, limitKey: string): Promise<{ success: boolean; allowed: boolean; current: number; limit: number }> {
  try { const supabase = await createClient(); const { data: subscription } = await supabase.from('plan_subscriptions').select('plan_id').eq('id', subscriptionId).single(); if (!subscription) return { success: false, allowed: false, current: 0, limit: 0 }; const { data: limit } = await supabase.from('plan_limits').select('limit_value').eq('plan_id', subscription.plan_id).eq('limit_key', limitKey).single(); if (!limit) return { success: true, allowed: true, current: 0, limit: -1 }; const currentMonth = new Date(); currentMonth.setDate(1); currentMonth.setHours(0, 0, 0, 0); const { data: usage } = await supabase.from('plan_usage').select('quantity').eq('subscription_id', subscriptionId).eq('limit_key', limitKey).gte('recorded_at', currentMonth.toISOString()); const current = usage?.reduce((sum, u) => sum + u.quantity, 0) || 0; return { success: true, allowed: current < limit.limit_value, current, limit: limit.limit_value } } catch (error) { return { success: false, allowed: false, current: 0, limit: 0 } }
}
