'use server'

/**
 * Extended Records Server Actions
 * Tables: records, record_types, record_fields, record_values, record_history, record_templates, record_permissions
 */

import { createClient } from '@/lib/supabase/server'

export async function getRecord(recordId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('records').select('*, record_types(*), record_values(*), record_history(*), users(*)').eq('id', recordId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRecord(recordData: { type_id: string; name: string; description?: string; owner_id?: string; organization_id?: string; parent_id?: string; values?: { field_id: string; value: any }[]; metadata?: any }) {
  try { const supabase = await createClient(); const { values, ...recordInfo } = recordData; const { data: record, error: recordError } = await supabase.from('records').insert({ ...recordInfo, status: 'active', created_at: new Date().toISOString() }).select().single(); if (recordError) throw recordError; if (values && values.length > 0) { const valuesData = values.map(v => ({ record_id: record.id, field_id: v.field_id, value: v.value, created_at: new Date().toISOString() })); await supabase.from('record_values').insert(valuesData) } await supabase.from('record_history').insert({ record_id: record.id, action: 'created', user_id: recordData.owner_id, created_at: new Date().toISOString() }); return { success: true, data: record } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRecord(recordId: string, updates: Partial<{ name: string; description: string; status: string; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('records').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', recordId).select().single(); if (error) throw error; await supabase.from('record_history').insert({ record_id: recordId, action: 'updated', user_id: userId, changes: updates, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRecord(recordId: string, userId?: string) {
  try { const supabase = await createClient(); await supabase.from('record_history').insert({ record_id: recordId, action: 'deleted', user_id: userId, created_at: new Date().toISOString() }); const { error } = await supabase.from('records').delete().eq('id', recordId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveRecord(recordId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('records').update({ status: 'archived', archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', recordId).select().single(); if (error) throw error; await supabase.from('record_history').insert({ record_id: recordId, action: 'archived', user_id: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecords(options?: { type_id?: string; owner_id?: string; organization_id?: string; parent_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('records').select('*, record_types(*), users(*)'); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecordValues(recordId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('record_values').select('*, record_fields(*)').eq('record_id', recordId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateRecordValue(recordId: string, fieldId: string, value: any, userId?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('record_values').select('id, value').eq('record_id', recordId).eq('field_id', fieldId).single(); if (existing) { const { data, error } = await supabase.from('record_values').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; await supabase.from('record_history').insert({ record_id: recordId, action: 'field_updated', user_id: userId, changes: { field_id: fieldId, old_value: existing.value, new_value: value }, created_at: new Date().toISOString() }); return { success: true, data } } else { const { data, error } = await supabase.from('record_values').insert({ record_id: recordId, field_id: fieldId, value, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecordTypes(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('record_types').select('*, record_fields(*)'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRecordType(typeData: { name: string; description?: string; category?: string; icon?: string; color?: string; fields?: { name: string; type: string; required?: boolean; options?: any }[] }) {
  try { const supabase = await createClient(); const { fields, ...typeInfo } = typeData; const { data: recordType, error: typeError } = await supabase.from('record_types').insert({ ...typeInfo, is_active: true, created_at: new Date().toISOString() }).select().single(); if (typeError) throw typeError; if (fields && fields.length > 0) { const fieldsData = fields.map((f, index) => ({ type_id: recordType.id, ...f, order: index + 1, created_at: new Date().toISOString() })); await supabase.from('record_fields').insert(fieldsData) } return { success: true, data: recordType } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecordFields(typeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('record_fields').select('*').eq('type_id', typeId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecordHistory(recordId: string, options?: { action?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('record_history').select('*, users(*)').eq('record_id', recordId); if (options?.action) query = query.eq('action', options.action); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getChildRecords(parentId: string, options?: { type_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('records').select('*, record_types(*)').eq('parent_id', parentId); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateRecord(recordId: string, userId?: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('records').select('*, record_values(*)').eq('id', recordId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, record_values, ...recordData } = original; const { data: newRecord, error: createError } = await supabase.from('records').insert({ ...recordData, name: `${recordData.name} (Copy)`, owner_id: userId || recordData.owner_id, created_at: new Date().toISOString() }).select().single(); if (createError) throw createError; if (record_values && record_values.length > 0) { const valuesData = record_values.map((v: any) => ({ record_id: newRecord.id, field_id: v.field_id, value: v.value, created_at: new Date().toISOString() })); await supabase.from('record_values').insert(valuesData) } return { success: true, data: newRecord } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
