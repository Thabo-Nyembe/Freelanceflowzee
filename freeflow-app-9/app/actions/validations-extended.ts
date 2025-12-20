'use server'

/**
 * Extended Validations Server Actions
 * Tables: validations, validation_rules, validation_results, validation_schemas, validation_logs, validation_configs
 */

import { createClient } from '@/lib/supabase/server'

export async function getValidation(validationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').select('*, validation_rules(*), validation_results(*)').eq('id', validationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createValidation(validationData: { name: string; description?: string; entity_type: string; schema_id?: string; rules?: any[]; is_active?: boolean; created_by?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').insert({ ...validationData, is_active: validationData.is_active ?? true, execution_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (validationData.rules && validationData.rules.length > 0) { const ruleRecords = validationData.rules.map((r, i) => ({ validation_id: data.id, field: r.field, rule_type: r.rule_type, rule_config: r.config, error_message: r.error_message, order_index: i, is_active: true, created_at: new Date().toISOString() })); await supabase.from('validation_rules').insert(ruleRecords) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateValidation(validationId: string, updates: Partial<{ name: string; description: string; entity_type: string; schema_id: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', validationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteValidation(validationId: string) {
  try { const supabase = await createClient(); await supabase.from('validation_rules').delete().eq('validation_id', validationId); await supabase.from('validation_results').delete().eq('validation_id', validationId); await supabase.from('validation_logs').delete().eq('validation_id', validationId); const { error } = await supabase.from('validations').delete().eq('id', validationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getValidations(options?: { entity_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('validations').select('*, validation_rules(count)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRule(validationId: string, ruleData: { field: string; rule_type: string; config?: any; error_message?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data: maxOrder } = await supabase.from('validation_rules').select('order_index').eq('validation_id', validationId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = ruleData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('validation_rules').insert({ validation_id: validationId, ...ruleData, order_index: orderIndex, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRule(ruleId: string, updates: Partial<{ field: string; rule_type: string; config: any; error_message: string; order_index: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validation_rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeRule(ruleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('validation_rules').delete().eq('id', ruleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(validationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validation_rules').select('*').eq('validation_id', validationId).eq('is_active', true).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function validate(validationId: string, data: any, options?: { entity_id?: string; executed_by?: string }): Promise<{ success: boolean; data?: { is_valid: boolean; errors: any[] }; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: validation } = await supabase.from('validations').select('*, validation_rules(*)').eq('id', validationId).single()
    if (!validation) return { success: false, error: 'Validation not found' }
    if (!validation.is_active) return { success: false, error: 'Validation is not active' }
    const errors: any[] = []
    for (const rule of (validation.validation_rules || []).sort((a: any, b: any) => a.order_index - b.order_index)) {
      if (!rule.is_active) continue
      const fieldValue = data[rule.field]
      const ruleResult = evaluateRule(rule, fieldValue, data)
      if (!ruleResult.valid) {
        errors.push({ field: rule.field, rule_type: rule.rule_type, message: rule.error_message || ruleResult.message })
      }
    }
    const isValid = errors.length === 0
    await supabase.from('validation_results').insert({ validation_id: validationId, entity_id: options?.entity_id, input_data: data, is_valid: isValid, errors: errors.length > 0 ? errors : null, executed_by: options?.executed_by, executed_at: new Date().toISOString(), created_at: new Date().toISOString() })
    await supabase.from('validations').update({ execution_count: supabase.rpc('increment_count', { row_id: validationId, count_column: 'execution_count' }), last_executed_at: new Date().toISOString() }).eq('id', validationId)
    await logValidation(validationId, isValid ? 'passed' : 'failed', { errors_count: errors.length }, options?.executed_by)
    return { success: true, data: { is_valid: isValid, errors } }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function evaluateRule(rule: any, value: any, allData: any): { valid: boolean; message?: string } {
  const config = rule.rule_config || {}
  switch (rule.rule_type) {
    case 'required': return { valid: value !== undefined && value !== null && value !== '', message: 'Field is required' }
    case 'min_length': return { valid: !value || String(value).length >= (config.min || 0), message: `Minimum length is ${config.min}` }
    case 'max_length': return { valid: !value || String(value).length <= (config.max || Infinity), message: `Maximum length is ${config.max}` }
    case 'min_value': return { valid: value === undefined || value === null || Number(value) >= (config.min || 0), message: `Minimum value is ${config.min}` }
    case 'max_value': return { valid: value === undefined || value === null || Number(value) <= (config.max || Infinity), message: `Maximum value is ${config.max}` }
    case 'pattern': return { valid: !value || new RegExp(config.pattern || '').test(String(value)), message: 'Invalid format' }
    case 'email': return { valid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)), message: 'Invalid email format' }
    case 'url': return { valid: !value || /^https?:\/\/.+/.test(String(value)), message: 'Invalid URL format' }
    case 'in_list': return { valid: !value || (config.values || []).includes(value), message: `Value must be one of: ${(config.values || []).join(', ')}` }
    case 'type': {
      if (!value) return { valid: true }
      switch (config.type) {
        case 'string': return { valid: typeof value === 'string', message: 'Must be a string' }
        case 'number': return { valid: typeof value === 'number' || !isNaN(Number(value)), message: 'Must be a number' }
        case 'boolean': return { valid: typeof value === 'boolean', message: 'Must be a boolean' }
        case 'array': return { valid: Array.isArray(value), message: 'Must be an array' }
        case 'object': return { valid: typeof value === 'object' && !Array.isArray(value), message: 'Must be an object' }
        default: return { valid: true }
      }
    }
    default: return { valid: true }
  }
}

async function logValidation(validationId: string, status: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('validation_logs').insert({ validation_id: validationId, status, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getResults(validationId: string, options?: { is_valid?: boolean; entity_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('validation_results').select('*').eq('validation_id', validationId); if (options?.is_valid !== undefined) query = query.eq('is_valid', options.is_valid); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); const { data, error } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSchema(schemaData: { name: string; description?: string; schema: any; version?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validation_schemas').insert({ ...schemaData, version: schemaData.version || '1.0.0', is_active: schemaData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSchemas(options?: { is_active?: boolean; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('validation_schemas').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setConfig(entityType: string, config: { strict_mode?: boolean; fail_fast?: boolean; default_validation_id?: string; custom_rules?: any }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('validation_configs').select('id').eq('entity_type', entityType).single(); if (existing) { const { data, error } = await supabase.from('validation_configs').update({ ...config, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('validation_configs').insert({ entity_type: entityType, ...config, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConfig(entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('validation_configs').select('*').eq('entity_type', entityType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
