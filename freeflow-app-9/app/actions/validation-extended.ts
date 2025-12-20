'use server'

/**
 * Extended Validation Server Actions - Covers all Validation-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getValidation(validationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').select('*').eq('id', validationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createValidation(validationData: { name: string; validation_type: string; entity_type: string; field: string; rules: Array<{ type: string; value?: any; message?: string }>; is_required?: boolean; is_active?: boolean; description?: string; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').insert({ ...validationData, is_active: validationData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateValidation(validationId: string, updates: Partial<{ name: string; rules: Array<{ type: string; value?: any; message?: string }>; is_required: boolean; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', validationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteValidation(validationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('validations').delete().eq('id', validationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateData(entityType: string, data: Record<string, any>) {
  try { const supabase = await createClient(); const { data: validations } = await supabase.from('validations').select('*').eq('entity_type', entityType).eq('is_active', true); const errors: Record<string, string[]> = {}; for (const validation of validations || []) { const fieldValue = data[validation.field]; const fieldErrors: string[] = []; if (validation.is_required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) { fieldErrors.push(validation.rules.find((r: any) => r.type === 'required')?.message || `${validation.field} is required`); } if (fieldValue != null && fieldValue !== '') { for (const rule of validation.rules) { const error = validateRule(rule, fieldValue, validation.field); if (error) fieldErrors.push(error); } } if (fieldErrors.length > 0) { errors[validation.field] = fieldErrors; } } return { success: true, valid: Object.keys(errors).length === 0, errors } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', valid: false, errors: {} } }
}

function validateRule(rule: { type: string; value?: any; message?: string }, value: any, field: string): string | null {
  const defaultMessage = (msg: string) => rule.message || msg;
  switch (rule.type) {
    case 'min_length': if (String(value).length < rule.value) return defaultMessage(`${field} must be at least ${rule.value} characters`); break;
    case 'max_length': if (String(value).length > rule.value) return defaultMessage(`${field} must be at most ${rule.value} characters`); break;
    case 'min': if (Number(value) < rule.value) return defaultMessage(`${field} must be at least ${rule.value}`); break;
    case 'max': if (Number(value) > rule.value) return defaultMessage(`${field} must be at most ${rule.value}`); break;
    case 'pattern': if (!new RegExp(rule.value).test(String(value))) return defaultMessage(`${field} format is invalid`); break;
    case 'email': if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return defaultMessage(`${field} must be a valid email`); break;
    case 'url': try { new URL(String(value)); } catch { return defaultMessage(`${field} must be a valid URL`); } break;
    case 'numeric': if (isNaN(Number(value))) return defaultMessage(`${field} must be a number`); break;
    case 'integer': if (!Number.isInteger(Number(value))) return defaultMessage(`${field} must be an integer`); break;
    case 'positive': if (Number(value) <= 0) return defaultMessage(`${field} must be positive`); break;
    case 'in': if (!Array.isArray(rule.value) || !rule.value.includes(value)) return defaultMessage(`${field} must be one of: ${rule.value?.join(', ')}`); break;
  }
  return null;
}

export async function getValidations(options?: { validationType?: string; entityType?: string; isActive?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('validations').select('*'); if (options?.validationType) query = query.eq('validation_type', options.validationType); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('field', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFieldValidations(entityType: string, field: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').select('*').eq('entity_type', entityType).eq('field', field).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateValidation(validationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', validationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateValidation(validationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', validationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
