'use server'

/**
 * Extended Plan Server Actions - Covers all Plan-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPlans(isActive?: boolean, planType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('plans').select('*').order('sort_order', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); if (planType) query = query.eq('plan_type', planType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPlan(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').select('*').eq('id', planId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPlan(input: { name: string; description?: string; plan_type: string; price_monthly?: number; price_yearly?: number; currency?: string; sort_order?: number; is_popular?: boolean; is_enterprise?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').insert({ ...input, is_active: true, subscriber_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlan(planId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', planId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function togglePlanActive(planId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plans').update({ is_active: isActive }).eq('id', planId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePlan(planId: string) {
  try { const supabase = await createClient(); await supabase.from('plan_features').delete().eq('plan_id', planId); const { error } = await supabase.from('plans').delete().eq('id', planId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderPlans(planIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < planIds.length; i++) { await supabase.from('plans').update({ sort_order: i }).eq('id', planIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlanFeatures(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_features').select('*').eq('plan_id', planId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPlanFeature(planId: string, input: { name: string; description?: string; feature_key: string; value?: any; is_included?: boolean; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_features').insert({ plan_id: planId, ...input, is_included: input.is_included ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlanFeature(featureId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plan_features').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', featureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePlanFeature(featureId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('plan_features').delete().eq('id', featureId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPlanFeatures(planId: string, features: Array<{ name: string; feature_key: string; value?: any; is_included?: boolean }>) {
  try { const supabase = await createClient(); await supabase.from('plan_features').delete().eq('plan_id', planId); if (features.length > 0) { const inserts = features.map((f, i) => ({ plan_id: planId, ...f, sort_order: i, is_included: f.is_included ?? true })); const { error } = await supabase.from('plan_features').insert(inserts); if (error) throw error; } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function comparePlans(planIds: string[]) {
  try { const supabase = await createClient(); const { data: plans, error: plansError } = await supabase.from('plans').select('*').in('id', planIds); if (plansError) throw plansError; const { data: features, error: featuresError } = await supabase.from('plan_features').select('*').in('plan_id', planIds); if (featuresError) throw featuresError; const featureKeys = [...new Set(features?.map(f => f.feature_key) || [])]; const comparison = featureKeys.map(key => { const featureByPlan: Record<string, any> = {}; planIds.forEach(planId => { const feature = features?.find(f => f.plan_id === planId && f.feature_key === key); featureByPlan[planId] = feature || { is_included: false }; }); return { feature_key: key, name: features?.find(f => f.feature_key === key)?.name || key, plans: featureByPlan }; }); return { success: true, data: { plans, comparison } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
