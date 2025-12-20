'use server'

/**
 * Extended Units Server Actions
 * Tables: units, unit_conversions, unit_groups, unit_aliases, unit_formats, unit_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getUnit(unitId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('units').select('*, unit_groups(*), unit_conversions(*), unit_aliases(*)').eq('id', unitId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUnit(unitData: { name: string; symbol: string; group_id?: string; base_unit?: boolean; conversion_factor?: number; description?: string; is_si?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('units').insert({ ...unitData, base_unit: unitData.base_unit ?? false, conversion_factor: unitData.conversion_factor ?? 1, is_si: unitData.is_si ?? false, is_active: unitData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUnit(unitId: string, updates: Partial<{ name: string; symbol: string; group_id: string; base_unit: boolean; conversion_factor: number; description: string; is_si: boolean; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('units').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', unitId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUnit(unitId: string) {
  try { const supabase = await createClient(); await supabase.from('unit_conversions').delete().or(`from_unit_id.eq.${unitId},to_unit_id.eq.${unitId}`); await supabase.from('unit_aliases').delete().eq('unit_id', unitId); await supabase.from('unit_formats').delete().eq('unit_id', unitId); const { error } = await supabase.from('units').delete().eq('id', unitId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnits(options?: { group_id?: string; is_si?: boolean; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('units').select('*, unit_groups(*)'); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.is_si !== undefined) query = query.eq('is_si', options.is_si); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,symbol.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUnitBySymbol(symbol: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('units').select('*, unit_groups(*)').eq('symbol', symbol).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) { const { data: aliasData } = await supabase.from('unit_aliases').select('units(*, unit_groups(*))').eq('alias', symbol).single(); return { success: true, data: aliasData?.units || null } } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGroup(groupData: { name: string; description?: string; dimension?: string; base_unit_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_groups').insert({ ...groupData, is_active: groupData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroups(options?: { is_active?: boolean; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('unit_groups').select('*, units(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addConversion(fromUnitId: string, toUnitId: string, conversionData: { factor: number; offset?: number; formula?: string; is_bidirectional?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_conversions').insert({ from_unit_id: fromUnitId, to_unit_id: toUnitId, ...conversionData, offset: conversionData.offset ?? 0, is_bidirectional: conversionData.is_bidirectional ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConversions(unitId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_conversions').select('*, from_unit:units!from_unit_id(*), to_unit:units!to_unit_id(*)').or(`from_unit_id.eq.${unitId},to_unit_id.eq.${unitId}`); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function convert(value: number, fromUnitId: string, toUnitId: string): Promise<{ success: boolean; data?: number; error?: string }> {
  try {
    if (fromUnitId === toUnitId) return { success: true, data: value }
    const supabase = await createClient()
    const { data: conversion } = await supabase.from('unit_conversions').select('*').eq('from_unit_id', fromUnitId).eq('to_unit_id', toUnitId).single()
    if (conversion) {
      const result = (value * conversion.factor) + (conversion.offset || 0)
      return { success: true, data: result }
    }
    const { data: reverseConversion } = await supabase.from('unit_conversions').select('*').eq('from_unit_id', toUnitId).eq('to_unit_id', fromUnitId).single()
    if (reverseConversion && reverseConversion.is_bidirectional) {
      const result = (value - (reverseConversion.offset || 0)) / reverseConversion.factor
      return { success: true, data: result }
    }
    const [fromUnit, toUnit] = await Promise.all([
      supabase.from('units').select('conversion_factor, group_id').eq('id', fromUnitId).single(),
      supabase.from('units').select('conversion_factor, group_id').eq('id', toUnitId).single()
    ])
    if (fromUnit.data && toUnit.data && fromUnit.data.group_id === toUnit.data.group_id) {
      const baseValue = value * fromUnit.data.conversion_factor
      const result = baseValue / toUnit.data.conversion_factor
      return { success: true, data: result }
    }
    return { success: false, error: 'No conversion path found' }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addAlias(unitId: string, alias: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_aliases').insert({ unit_id: unitId, alias, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAliases(unitId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_aliases').select('*').eq('unit_id', unitId).order('alias', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setFormat(unitId: string, formatData: { locale?: string; format_pattern: string; decimal_places?: number; prefix?: string; suffix?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('unit_formats').select('id').eq('unit_id', unitId).eq('locale', formatData.locale || 'default').single(); if (existing) { const { data, error } = await supabase.from('unit_formats').update({ ...formatData, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('unit_formats').insert({ unit_id: unitId, locale: formatData.locale || 'default', ...formatData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFormat(unitId: string, locale?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_formats').select('*').eq('unit_id', unitId).eq('locale', locale || 'default').single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPreference(userId: string, groupId: string, preferredUnitId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('unit_preferences').select('id').eq('user_id', userId).eq('group_id', groupId).single(); if (existing) { const { data, error } = await supabase.from('unit_preferences').update({ preferred_unit_id: preferredUnitId, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('unit_preferences').insert({ user_id: userId, group_id: groupId, preferred_unit_id: preferredUnitId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('unit_preferences').select('*, unit_groups(*), units(*)').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
