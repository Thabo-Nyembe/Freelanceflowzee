'use server'

/**
 * Extended Triggers Server Actions
 * Tables: triggers, trigger_conditions, trigger_actions, trigger_executions, trigger_logs, trigger_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrigger(triggerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').select('*, trigger_conditions(*), trigger_actions(*)').eq('id', triggerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrigger(triggerData: { name: string; description?: string; trigger_type: string; event_type?: string; entity_type?: string; conditions?: any[]; actions?: any[]; priority?: number; is_active?: boolean; created_by: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: trigger, error: triggerError } = await supabase.from('triggers').insert({ name: triggerData.name, description: triggerData.description, trigger_type: triggerData.trigger_type, event_type: triggerData.event_type, entity_type: triggerData.entity_type, priority: triggerData.priority || 0, is_active: triggerData.is_active ?? true, created_by: triggerData.created_by, execution_count: 0, metadata: triggerData.metadata, created_at: new Date().toISOString() }).select().single(); if (triggerError) throw triggerError; if (triggerData.conditions && triggerData.conditions.length > 0) { const conditionRecords = triggerData.conditions.map((c, i) => ({ trigger_id: trigger.id, field: c.field, operator: c.operator, value: c.value, logic_operator: c.logic_operator || 'AND', order_index: i, created_at: new Date().toISOString() })); await supabase.from('trigger_conditions').insert(conditionRecords) } if (triggerData.actions && triggerData.actions.length > 0) { const actionRecords = triggerData.actions.map((a, i) => ({ trigger_id: trigger.id, action_type: a.action_type, action_config: a.config, order_index: i, is_active: true, created_at: new Date().toISOString() })); await supabase.from('trigger_actions').insert(actionRecords) } return { success: true, data: trigger } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrigger(triggerId: string, updates: Partial<{ name: string; description: string; trigger_type: string; event_type: string; entity_type: string; priority: number; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', triggerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTrigger(triggerId: string) {
  try { const supabase = await createClient(); await supabase.from('trigger_conditions').delete().eq('trigger_id', triggerId); await supabase.from('trigger_actions').delete().eq('trigger_id', triggerId); await supabase.from('trigger_executions').delete().eq('trigger_id', triggerId); await supabase.from('trigger_logs').delete().eq('trigger_id', triggerId); await supabase.from('trigger_schedules').delete().eq('trigger_id', triggerId); const { error } = await supabase.from('triggers').delete().eq('id', triggerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTriggers(options?: { trigger_type?: string; event_type?: string; entity_type?: string; is_active?: boolean; created_by?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('triggers').select('*, trigger_conditions(count), trigger_actions(count)'); if (options?.trigger_type) query = query.eq('trigger_type', options.trigger_type); if (options?.event_type) query = query.eq('event_type', options.event_type); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('priority', { ascending: false }).order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCondition(triggerId: string, conditionData: { field: string; operator: string; value: any; logic_operator?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data: maxOrder } = await supabase.from('trigger_conditions').select('order_index').eq('trigger_id', triggerId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = conditionData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('trigger_conditions').insert({ trigger_id: triggerId, ...conditionData, logic_operator: conditionData.logic_operator || 'AND', order_index: orderIndex, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCondition(conditionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('trigger_conditions').delete().eq('id', conditionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addAction(triggerId: string, actionData: { action_type: string; config: any; order_index?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data: maxOrder } = await supabase.from('trigger_actions').select('order_index').eq('trigger_id', triggerId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = actionData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('trigger_actions').insert({ trigger_id: triggerId, action_type: actionData.action_type, action_config: actionData.config, order_index: orderIndex, is_active: actionData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeAction(actionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('trigger_actions').delete().eq('id', actionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeTrigger(triggerId: string, context: { entity_id?: string; event_data?: any; executed_by?: string }) {
  try { const supabase = await createClient(); const { data: trigger } = await supabase.from('triggers').select('*, trigger_conditions(*), trigger_actions(*)').eq('id', triggerId).single(); if (!trigger) return { success: false, error: 'Trigger not found' }; if (!trigger.is_active) return { success: false, error: 'Trigger is not active' }; const conditionsMet = evaluateConditions(trigger.trigger_conditions || [], context.event_data || {}); if (!conditionsMet) { await logExecution(triggerId, 'skipped', { reason: 'Conditions not met' }, context.executed_by); return { success: true, data: { executed: false, reason: 'Conditions not met' } } } const actionResults: any[] = []; for (const action of (trigger.trigger_actions || []).sort((a: any, b: any) => a.order_index - b.order_index)) { if (!action.is_active) continue; const result = await executeAction(action, context); actionResults.push({ action_id: action.id, action_type: action.action_type, success: result.success, result: result.data }) } await supabase.from('trigger_executions').insert({ trigger_id: triggerId, entity_id: context.entity_id, event_data: context.event_data, actions_executed: actionResults.length, status: 'completed', executed_at: new Date().toISOString(), created_at: new Date().toISOString() }); await supabase.from('triggers').update({ execution_count: supabase.rpc('increment_count', { row_id: triggerId, count_column: 'execution_count' }), last_executed_at: new Date().toISOString() }).eq('id', triggerId); await logExecution(triggerId, 'executed', { actions: actionResults }, context.executed_by); return { success: true, data: { executed: true, actions: actionResults } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function evaluateConditions(conditions: any[], data: any): boolean {
  if (conditions.length === 0) return true
  let result = true
  for (const condition of conditions.sort((a, b) => a.order_index - b.order_index)) {
    const fieldValue = data[condition.field]
    let conditionResult = false
    switch (condition.operator) {
      case 'equals': conditionResult = fieldValue === condition.value; break
      case 'not_equals': conditionResult = fieldValue !== condition.value; break
      case 'contains': conditionResult = String(fieldValue).includes(condition.value); break
      case 'greater_than': conditionResult = fieldValue > condition.value; break
      case 'less_than': conditionResult = fieldValue < condition.value; break
      case 'is_empty': conditionResult = !fieldValue || fieldValue === ''; break
      case 'is_not_empty': conditionResult = !!fieldValue && fieldValue !== ''; break
      default: conditionResult = true
    }
    if (condition.logic_operator === 'OR') result = result || conditionResult
    else result = result && conditionResult
  }
  return result
}

async function executeAction(action: any, context: any): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: { action_type: action.action_type, config: action.action_config } }
}

async function logExecution(triggerId: string, status: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('trigger_logs').insert({ trigger_id: triggerId, status, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getExecutions(triggerId: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('trigger_executions').select('*').eq('trigger_id', triggerId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('executed_at', options.from_date); if (options?.to_date) query = query.lte('executed_at', options.to_date); const { data, error } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLogs(triggerId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('trigger_logs').select('*, users(*)').eq('trigger_id', triggerId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSchedule(triggerId: string, scheduleData: { cron_expression: string; timezone?: string; start_date?: string; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trigger_schedules').insert({ trigger_id: triggerId, ...scheduleData, timezone: scheduleData.timezone || 'UTC', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSchedules(triggerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trigger_schedules').select('*').eq('trigger_id', triggerId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
