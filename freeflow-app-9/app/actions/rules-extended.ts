'use server'

/**
 * Extended Rules Server Actions
 * Tables: rules, rule_conditions, rule_actions, rule_executions, rule_groups, rule_templates
 */

import { createClient } from '@/lib/supabase/server'

export async function getRule(ruleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').select('*, rule_conditions(*), rule_actions(*), rule_groups(*)').eq('id', ruleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRule(ruleData: { name: string; description?: string; group_id?: string; type?: string; trigger_event?: string; conditions?: any[]; actions?: any[]; priority?: number; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { conditions, actions, ...ruleInfo } = ruleData; const { data: rule, error: ruleError } = await supabase.from('rules').insert({ ...ruleInfo, is_active: ruleInfo.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (ruleError) throw ruleError; if (conditions && conditions.length > 0) { const condData = conditions.map((c, i) => ({ rule_id: rule.id, condition_order: i, ...c, created_at: new Date().toISOString() })); await supabase.from('rule_conditions').insert(condData) } if (actions && actions.length > 0) { const actData = actions.map((a, i) => ({ rule_id: rule.id, action_order: i, ...a, created_at: new Date().toISOString() })); await supabase.from('rule_actions').insert(actData) } return { success: true, data: rule } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRule(ruleId: string, updates: Partial<{ name: string; description: string; group_id: string; type: string; trigger_event: string; priority: number; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRule(ruleId: string) {
  try { const supabase = await createClient(); await supabase.from('rule_conditions').delete().eq('rule_id', ruleId); await supabase.from('rule_actions').delete().eq('rule_id', ruleId); await supabase.from('rule_executions').delete().eq('rule_id', ruleId); const { error } = await supabase.from('rules').delete().eq('id', ruleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(options?: { group_id?: string; type?: string; trigger_event?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rules').select('*, rule_conditions(count), rule_actions(count), rule_groups(*)'); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.type) query = query.eq('type', options.type); if (options?.trigger_event) query = query.eq('trigger_event', options.trigger_event); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('priority', { ascending: true }).order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateRuleConditions(ruleId: string, conditions: any[]) {
  try { const supabase = await createClient(); await supabase.from('rule_conditions').delete().eq('rule_id', ruleId); if (conditions.length > 0) { const condData = conditions.map((c, i) => ({ rule_id: ruleId, condition_order: i, ...c, created_at: new Date().toISOString() })); await supabase.from('rule_conditions').insert(condData) } await supabase.from('rules').update({ updated_at: new Date().toISOString() }).eq('id', ruleId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRuleActions(ruleId: string, actions: any[]) {
  try { const supabase = await createClient(); await supabase.from('rule_actions').delete().eq('rule_id', ruleId); if (actions.length > 0) { const actData = actions.map((a, i) => ({ rule_id: ruleId, action_order: i, ...a, created_at: new Date().toISOString() })); await supabase.from('rule_actions').insert(actData) } await supabase.from('rules').update({ updated_at: new Date().toISOString() }).eq('id', ruleId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeRule(ruleId: string, context: any) {
  try { const supabase = await createClient(); const { data: rule } = await supabase.from('rules').select('*, rule_conditions(*), rule_actions(*)').eq('id', ruleId).single(); if (!rule || !rule.is_active) return { success: false, error: 'Rule not found or inactive' }; const conditionsMet = evaluateConditions(rule.rule_conditions, context); const { data: execution, error } = await supabase.from('rule_executions').insert({ rule_id: ruleId, context, conditions_met: conditionsMet, actions_executed: conditionsMet ? rule.rule_actions : [], status: conditionsMet ? 'executed' : 'skipped', executed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { execution, conditionsMet, actionsExecuted: conditionsMet ? rule.rule_actions : [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function evaluateConditions(conditions: any[], context: any): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every(c => {
    const value = context[c.field]
    switch (c.operator) {
      case 'equals': return value === c.value
      case 'not_equals': return value !== c.value
      case 'contains': return String(value).includes(c.value)
      case 'greater_than': return value > c.value
      case 'less_than': return value < c.value
      case 'in': return Array.isArray(c.value) && c.value.includes(value)
      default: return true
    }
  })
}

export async function getRuleExecutions(ruleId: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rule_executions').select('*').eq('rule_id', ruleId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('executed_at', options.from_date); if (options?.to_date) query = query.lte('executed_at', options.to_date); const { data, error } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRuleGroups(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('rule_groups').select('*, rules(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRuleTemplates(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('rule_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRuleFromTemplate(templateId: string, name: string, overrides?: any) {
  try { const supabase = await createClient(); const { data: template } = await supabase.from('rule_templates').select('*').eq('id', templateId).single(); if (!template) return { success: false, error: 'Template not found' }; const ruleData = { name, description: template.description, type: template.type, trigger_event: template.trigger_event, conditions: template.default_conditions, actions: template.default_actions, ...overrides }; return createRule(ruleData) } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleRule(ruleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rules').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

