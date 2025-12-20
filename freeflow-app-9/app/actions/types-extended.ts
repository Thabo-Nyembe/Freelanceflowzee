'use server'

/**
 * Extended Types Server Actions
 * Tables: types, type_fields, type_values, type_hierarchies, type_mappings, type_validations
 */

import { createClient } from '@/lib/supabase/server'

export async function getType(typeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('types').select('*, type_fields(*), type_values(count)').eq('id', typeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createType(typeData: { name: string; code: string; description?: string; category?: string; parent_id?: string; is_system?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('types').insert({ ...typeData, is_system: typeData.is_system ?? false, is_active: typeData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateType(typeId: string, updates: Partial<{ name: string; code: string; description: string; category: string; parent_id: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('types').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', typeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteType(typeId: string) {
  try { const supabase = await createClient(); const { data: type } = await supabase.from('types').select('is_system').eq('id', typeId).single(); if (type?.is_system) return { success: false, error: 'Cannot delete system type' }; await supabase.from('type_fields').delete().eq('type_id', typeId); await supabase.from('type_values').delete().eq('type_id', typeId); await supabase.from('type_validations').delete().eq('type_id', typeId); const { error } = await supabase.from('types').delete().eq('id', typeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTypes(options?: { category?: string; parent_id?: string; is_system?: boolean; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('types').select('*, type_fields(count), type_values(count)'); if (options?.category) query = query.eq('category', options.category); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); else if (options?.parent_id === null) query = query.is('parent_id', null); if (options?.is_system !== undefined) query = query.eq('is_system', options.is_system); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTypeByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('types').select('*, type_fields(*), type_values(*)').eq('code', code).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addField(typeId: string, fieldData: { name: string; code: string; field_type: string; is_required?: boolean; default_value?: any; options?: any; order_index?: number; validations?: any }) {
  try { const supabase = await createClient(); const { data: maxOrder } = await supabase.from('type_fields').select('order_index').eq('type_id', typeId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = fieldData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('type_fields').insert({ type_id: typeId, ...fieldData, is_required: fieldData.is_required ?? false, order_index: orderIndex, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateField(fieldId: string, updates: Partial<{ name: string; code: string; field_type: string; is_required: boolean; default_value: any; options: any; order_index: number; validations: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('type_fields').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fieldId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeField(fieldId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('type_fields').delete().eq('id', fieldId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFields(typeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('type_fields').select('*').eq('type_id', typeId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addValue(typeId: string, valueData: { name: string; code: string; value?: any; description?: string; order_index?: number; is_default?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); if (valueData.is_default) { await supabase.from('type_values').update({ is_default: false }).eq('type_id', typeId).eq('is_default', true) } const { data: maxOrder } = await supabase.from('type_values').select('order_index').eq('type_id', typeId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = valueData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('type_values').insert({ type_id: typeId, ...valueData, is_default: valueData.is_default ?? false, is_active: valueData.is_active ?? true, order_index: orderIndex, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateValue(valueId: string, updates: Partial<{ name: string; code: string; value: any; description: string; order_index: number; is_default: boolean; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); if (updates.is_default) { const { data: current } = await supabase.from('type_values').select('type_id').eq('id', valueId).single(); if (current) await supabase.from('type_values').update({ is_default: false }).eq('type_id', current.type_id).eq('is_default', true) } const { data, error } = await supabase.from('type_values').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', valueId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeValue(valueId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('type_values').delete().eq('id', valueId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getValues(typeId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('type_values').select('*').eq('type_id', typeId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTypeHierarchy(typeId: string) {
  try { const supabase = await createClient(); const hierarchy: any[] = []; let currentId: string | null = typeId; while (currentId) { const { data } = await supabase.from('types').select('*').eq('id', currentId).single(); if (!data) break; hierarchy.unshift(data); currentId = data.parent_id } return { success: true, data: hierarchy } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getChildTypes(typeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('types').select('*').eq('parent_id', typeId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMapping(sourceTypeId: string, targetTypeId: string, mappingData: { mapping_type: string; field_mappings?: any; is_bidirectional?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('type_mappings').insert({ source_type_id: sourceTypeId, target_type_id: targetTypeId, ...mappingData, is_bidirectional: mappingData.is_bidirectional ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMappings(typeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('type_mappings').select('*, source_type:types!source_type_id(*), target_type:types!target_type_id(*)').or(`source_type_id.eq.${typeId},target_type_id.eq.${typeId}`); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addValidation(typeId: string, validationData: { field_id?: string; validation_type: string; validation_rule: any; error_message?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('type_validations').insert({ type_id: typeId, ...validationData, is_active: validationData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getValidations(typeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('type_validations').select('*, type_fields(*)').eq('type_id', typeId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCategories() {
  try { const supabase = await createClient(); const { data } = await supabase.from('types').select('category').not('category', 'is', null); const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]; return { success: true, data: unique } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
