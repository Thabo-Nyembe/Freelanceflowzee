'use server'

/**
 * Extended Tier Server Actions - Covers all Tier-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTiers(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('tiers').select('*').order('level', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTier(tierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').select('*').eq('id', tierId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTierByLevel(level: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').select('*').eq('level', level).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTier(input: { name: string; description?: string; level: number; min_points?: number; max_points?: number; color?: string; icon?: string; multiplier?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').insert({ ...input, is_active: true, member_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTier(tierId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleTierActive(tierId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').update({ is_active: isActive }).eq('id', tierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTier(tierId: string) {
  try { const supabase = await createClient(); await supabase.from('tier_benefits').delete().eq('tier_id', tierId); const { error } = await supabase.from('tiers').delete().eq('id', tierId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function calculateUserTier(points: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tiers').select('*').eq('is_active', true).lte('min_points', points).order('level', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTierBenefits(tierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_benefits').select('*').eq('tier_id', tierId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTierBenefit(tierId: string, input: { name: string; description?: string; benefit_type: string; value?: any; is_active?: boolean; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_benefits').insert({ tier_id: tierId, ...input, is_active: input.is_active ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTierBenefit(benefitId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tier_benefits').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', benefitId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTierBenefit(benefitId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tier_benefits').delete().eq('id', benefitId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setTierBenefits(tierId: string, benefits: Array<{ name: string; benefit_type: string; value?: any }>) {
  try { const supabase = await createClient(); await supabase.from('tier_benefits').delete().eq('tier_id', tierId); if (benefits.length > 0) { const inserts = benefits.map((b, i) => ({ tier_id: tierId, ...b, sort_order: i, is_active: true })); const { error } = await supabase.from('tier_benefits').insert(inserts); if (error) throw error; } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserBenefitsForTier(tierId: string) {
  try { const supabase = await createClient(); const { data: tier, error: tierError } = await supabase.from('tiers').select('level').eq('id', tierId).single(); if (tierError) throw tierError; const { data: allTiers, error: tiersError } = await supabase.from('tiers').select('id').lte('level', tier.level); if (tiersError) throw tiersError; const tierIds = allTiers?.map(t => t.id) || []; const { data: benefits, error: benefitsError } = await supabase.from('tier_benefits').select('*').in('tier_id', tierIds).eq('is_active', true); if (benefitsError) throw benefitsError; return { success: true, data: benefits || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
