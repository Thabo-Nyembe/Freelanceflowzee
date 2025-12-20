'use server'

/**
 * Extended Tiers Server Actions
 * Tables: tiers, tier_features, tier_limits, tier_pricing, tier_subscriptions, tier_upgrades
 */

import { createClient } from '@/lib/supabase/server'

export async function getTier(tierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)').eq('id', tierId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTier(tierData: { name: string; slug: string; description?: string; tier_level: number; tier_type?: string; is_default?: boolean; is_public?: boolean; trial_days?: number; metadata?: any }) {
  try { const supabase = await createClient(); if (tierData.is_default) { await supabase.from('tiers').update({ is_default: false }).eq('is_default', true) } const { data, error } = await supabase.from('tiers').insert({ ...tierData, is_default: tierData.is_default ?? false, is_public: tierData.is_public ?? true, status: 'active', subscriber_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTier(tierId: string, updates: Partial<{ name: string; description: string; tier_level: number; tier_type: string; is_default: boolean; is_public: boolean; trial_days: number; status: string; metadata: any }>) {
  try { const supabase = await createClient(); if (updates.is_default) { await supabase.from('tiers').update({ is_default: false }).eq('is_default', true) } const { data, error } = await supabase.from('tiers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTier(tierId: string) {
  try { const supabase = await createClient(); await supabase.from('tier_features').delete().eq('tier_id', tierId); await supabase.from('tier_limits').delete().eq('tier_id', tierId); await supabase.from('tier_pricing').delete().eq('tier_id', tierId); const { error } = await supabase.from('tiers').delete().eq('id', tierId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTiers(options?: { tier_type?: string; is_public?: boolean; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)'); if (options?.tier_type) query = query.eq('tier_type', options.tier_type); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('tier_level', { ascending: true }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFeature(tierId: string, featureData: { feature_key: string; feature_name: string; description?: string; is_enabled?: boolean; value?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_features').insert({ tier_id: tierId, ...featureData, is_enabled: featureData.is_enabled ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFeature(featureId: string, updates: Partial<{ feature_name: string; description: string; is_enabled: boolean; value: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_features').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', featureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatures(tierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_features').select('*').eq('tier_id', tierId).order('feature_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setLimit(tierId: string, limitData: { limit_key: string; limit_name: string; limit_value: number; limit_type?: string; reset_period?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_limits').upsert({ tier_id: tierId, ...limitData, updated_at: new Date().toISOString() }, { onConflict: 'tier_id,limit_key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLimits(tierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_limits').select('*').eq('tier_id', tierId).order('limit_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setPricing(tierId: string, pricingData: { billing_period: string; price: number; currency?: string; stripe_price_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_pricing').upsert({ tier_id: tierId, ...pricingData, currency: pricingData.currency || 'USD', is_active: pricingData.is_active ?? true, updated_at: new Date().toISOString() }, { onConflict: 'tier_id,billing_period' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPricing(tierId: string, options?: { billing_period?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('tier_pricing').select('*').eq('tier_id', tierId); if (options?.billing_period) query = query.eq('billing_period', options.billing_period); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('price', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function subscribeTier(tierId: string, subscriberData: { entity_type: string; entity_id: string; billing_period?: string; trial_end?: string; starts_at?: string }) {
  try { const supabase = await createClient(); const { data: tier } = await supabase.from('tiers').select('trial_days').eq('id', tierId).single(); let trialEnd = subscriberData.trial_end; if (!trialEnd && tier?.trial_days) { trialEnd = new Date(Date.now() + tier.trial_days * 24 * 60 * 60 * 1000).toISOString() } const { data, error } = await supabase.from('tier_subscriptions').insert({ tier_id: tierId, entity_type: subscriberData.entity_type, entity_id: subscriberData.entity_id, billing_period: subscriberData.billing_period || 'monthly', trial_end: trialEnd, starts_at: subscriberData.starts_at || new Date().toISOString(), status: trialEnd ? 'trialing' : 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('tiers').update({ subscriber_count: supabase.rpc('increment_count', { row_id: tierId, count_column: 'subscriber_count' }) }).eq('id', tierId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelSubscription(subscriptionId: string, cancelAt?: string) {
  try { const supabase = await createClient(); const { data: sub } = await supabase.from('tier_subscriptions').select('tier_id').eq('id', subscriptionId).single(); const { data, error } = await supabase.from('tier_subscriptions').update({ status: cancelAt ? 'scheduled_cancel' : 'cancelled', cancel_at: cancelAt, cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', subscriptionId).select().single(); if (error) throw error; if (!cancelAt && sub?.tier_id) { await supabase.rpc('decrement_count', { row_id: sub.tier_id, table_name: 'tiers', count_column: 'subscriber_count' }) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function upgradeTier(subscriptionId: string, newTierId: string, immediate: boolean = false) {
  try { const supabase = await createClient(); const { data: sub } = await supabase.from('tier_subscriptions').select('*').eq('id', subscriptionId).single(); if (!sub) return { success: false, error: 'Subscription not found' }; await supabase.from('tier_upgrades').insert({ subscription_id: subscriptionId, from_tier_id: sub.tier_id, to_tier_id: newTierId, effective_at: immediate ? new Date().toISOString() : sub.ends_at, status: immediate ? 'completed' : 'scheduled', created_at: new Date().toISOString() }); if (immediate) { await supabase.from('tier_subscriptions').update({ tier_id: newTierId, updated_at: new Date().toISOString() }).eq('id', subscriptionId); await supabase.rpc('decrement_count', { row_id: sub.tier_id, table_name: 'tiers', count_column: 'subscriber_count' }); await supabase.from('tiers').update({ subscriber_count: supabase.rpc('increment_count', { row_id: newTierId, count_column: 'subscriber_count' }) }).eq('id', newTierId) } return { success: true, data: { subscriptionId, newTierId, immediate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscription(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_subscriptions').select('*, tiers(*, tier_features(*), tier_limits(*))').eq('entity_type', entityType).eq('entity_id', entityId).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkFeatureAccess(entityType: string, entityId: string, featureKey: string) {
  try { const result = await getSubscription(entityType, entityId); if (!result.success || !result.data) return { success: true, data: { hasAccess: false, reason: 'No active subscription' } }; const feature = result.data.tiers?.tier_features?.find((f: any) => f.feature_key === featureKey); if (!feature) return { success: true, data: { hasAccess: false, reason: 'Feature not available in tier' } }; return { success: true, data: { hasAccess: feature.is_enabled, feature } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkLimitUsage(entityType: string, entityId: string, limitKey: string, currentUsage: number) {
  try { const result = await getSubscription(entityType, entityId); if (!result.success || !result.data) return { success: true, data: { withinLimit: false, reason: 'No active subscription' } }; const limit = result.data.tiers?.tier_limits?.find((l: any) => l.limit_key === limitKey); if (!limit) return { success: true, data: { withinLimit: true, reason: 'No limit defined' } }; return { success: true, data: { withinLimit: currentUsage < limit.limit_value, limit: limit.limit_value, current: currentUsage, remaining: Math.max(0, limit.limit_value - currentUsage) } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
