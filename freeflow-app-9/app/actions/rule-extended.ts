'use server'

/**
 * Extended Rule Server Actions - Covers all Rule-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRule(ruleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').select('*').eq('id', ruleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRule(ruleData: { name: string; rule_type: string; conditions: Array<{ field: string; operator: string; value: any }>; actions: Array<{ type: string; config: Record<string, any> }>; priority?: number; is_active?: boolean; description?: string; entity_type?: string; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').insert({ ...ruleData, is_active: ruleData.is_active ?? true, execution_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRule(ruleId: string, updates: Partial<{ name: string; conditions: Array<{ field: string; operator: string; value: any }>; actions: Array<{ type: string; config: Record<string, any> }>; priority: number; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRule(ruleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('rules').delete().eq('id', ruleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateRule(ruleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateRule(ruleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function evaluateRules(entityType: string, context: Record<string, any>) {
  try { const supabase = await createClient(); const { data: rules } = await supabase.from('rules').select('*').eq('entity_type', entityType).eq('is_active', true).order('priority', { ascending: false }); const matchingRules: any[] = []; for (const rule of rules || []) { if (evaluateConditions(rule.conditions, context)) { matchingRules.push(rule); } } return { success: true, rules: matchingRules } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', rules: [] } }
}

function evaluateConditions(conditions: Array<{ field: string; operator: string; value: any }>, context: Record<string, any>): boolean {
  return conditions.every(c => {
    const fieldValue = context[c.field];
    switch (c.operator) {
      case 'equals': return fieldValue === c.value;
      case 'not_equals': return fieldValue !== c.value;
      case 'contains': return String(fieldValue).includes(String(c.value));
      case 'greater_than': return Number(fieldValue) > Number(c.value);
      case 'less_than': return Number(fieldValue) < Number(c.value);
      case 'in': return Array.isArray(c.value) && c.value.includes(fieldValue);
      default: return false;
    }
  });
}

export async function getRules(options?: { ruleType?: string; entityType?: string; isActive?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('rules').select('*'); if (options?.ruleType) query = query.eq('rule_type', options.ruleType); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordRuleExecution(ruleId: string, result: { matched: boolean; actions_executed?: string[]; context?: Record<string, any> }) {
  try { const supabase = await createClient(); await supabase.from('rule_executions').insert({ rule_id: ruleId, ...result, executed_at: new Date().toISOString() }); if (result.matched) { await supabase.from('rules').update({ execution_count: supabase.rpc('increment_rule_executions', { rule_id: ruleId }), last_executed_at: new Date().toISOString() }).eq('id', ruleId); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
