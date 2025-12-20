'use server'

/**
 * Extended Custom Server Actions - Covers all Custom field/attribute tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCustomField(fieldId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('custom_fields').select('*').eq('id', fieldId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCustomField(fieldData: { name: string; field_key: string; field_type: string; entity_type: string; description?: string; options?: any[]; default_value?: any; is_required?: boolean; is_searchable?: boolean; validation_rules?: Record<string, any>; display_order?: number; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('custom_fields').insert({ ...fieldData, is_required: fieldData.is_required ?? false, is_searchable: fieldData.is_searchable ?? false, display_order: fieldData.display_order ?? 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCustomField(fieldId: string, updates: Partial<{ name: string; description: string; options: any[]; default_value: any; is_required: boolean; is_searchable: boolean; validation_rules: Record<string, any>; display_order: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('custom_fields').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fieldId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCustomField(fieldId: string) {
  try { const supabase = await createClient(); await supabase.from('custom_field_values').delete().eq('field_id', fieldId); const { error } = await supabase.from('custom_fields').delete().eq('id', fieldId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomFields(entityType: string, workspaceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('custom_fields').select('*').eq('entity_type', entityType); if (workspaceId) query = query.eq('workspace_id', workspaceId); const { data, error } = await query.order('display_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setCustomFieldValue(entityType: string, entityId: string, fieldId: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('custom_field_values').upsert({ entity_type: entityType, entity_id: entityId, field_id: fieldId, value, updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id,field_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomFieldValues(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('custom_field_values').select('*, custom_fields(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setCustomFieldValues(entityType: string, entityId: string, values: Record<string, any>) {
  try { const supabase = await createClient(); const entries = Object.entries(values).map(([fieldId, value]) => ({ entity_type: entityType, entity_id: entityId, field_id: fieldId, value, updated_at: new Date().toISOString() })); const { data, error } = await supabase.from('custom_field_values').upsert(entries, { onConflict: 'entity_type,entity_id,field_id' }).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchByCustomField(entityType: string, fieldId: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('custom_field_values').select('entity_id').eq('entity_type', entityType).eq('field_id', fieldId).eq('value', value); if (error) throw error; return { success: true, entityIds: data?.map(d => d.entity_id) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', entityIds: [] } }
}

export async function reorderCustomFields(fieldOrders: Array<{ id: string; display_order: number }>) {
  try { const supabase = await createClient(); for (const { id, display_order } of fieldOrders) { await supabase.from('custom_fields').update({ display_order, updated_at: new Date().toISOString() }).eq('id', id); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
