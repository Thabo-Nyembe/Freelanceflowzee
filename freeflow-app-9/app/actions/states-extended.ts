'use server'

/**
 * Extended States Server Actions
 * Tables: states, state_machines, state_transitions, state_history, state_rules, state_triggers
 */

import { createClient } from '@/lib/supabase/server'

export async function getState(stateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').select('*, state_machines(*), state_transitions(*), state_rules(*)').eq('id', stateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createState(stateData: { name: string; code: string; machine_id: string; description?: string; state_type?: string; color?: string; is_initial?: boolean; is_final?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').insert({ ...stateData, is_active: stateData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateState(stateId: string, updates: Partial<{ name: string; code: string; description: string; state_type: string; color: string; is_initial: boolean; is_final: boolean; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteState(stateId: string) {
  try { const supabase = await createClient(); await supabase.from('state_transitions').delete().or(`from_state_id.eq.${stateId},to_state_id.eq.${stateId}`); await supabase.from('state_rules').delete().eq('state_id', stateId); const { error } = await supabase.from('states').delete().eq('id', stateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStates(options?: { machine_id?: string; state_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('states').select('*, state_machines(*)'); if (options?.machine_id) query = query.eq('machine_id', options.machine_id); if (options?.state_type) query = query.eq('state_type', options.state_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStateMachine(machineData: { name: string; code: string; description?: string; entity_type: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('state_machines').insert({ ...machineData, is_active: machineData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStateMachines(options?: { entity_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('state_machines').select('*, states(count)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTransition(transitionData: { from_state_id: string; to_state_id: string; event_name: string; conditions?: any; actions?: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('state_transitions').insert({ ...transitionData, is_active: transitionData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransitions(machineId: string) {
  try { const supabase = await createClient(); const { data: states } = await supabase.from('states').select('id').eq('machine_id', machineId); const stateIds = states?.map(s => s.id) || []; if (stateIds.length === 0) return { success: true, data: [] }; const { data, error } = await supabase.from('state_transitions').select('*, from_state:from_state_id(*), to_state:to_state_id(*)').in('from_state_id', stateIds); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function transitionState(entityType: string, entityId: string, machineId: string, eventName: string, triggeredBy?: string, context?: any) {
  try { const supabase = await createClient(); const { data: currentHistory } = await supabase.from('state_history').select('*, states(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('machine_id', machineId).order('transitioned_at', { ascending: false }).limit(1).single(); const currentStateId = currentHistory?.state_id; if (!currentStateId) { const { data: initialState } = await supabase.from('states').select('*').eq('machine_id', machineId).eq('is_initial', true).single(); if (!initialState) return { success: false, error: 'No initial state found' }; await supabase.from('state_history').insert({ entity_type: entityType, entity_id: entityId, machine_id: machineId, state_id: initialState.id, event_name: 'initialize', triggered_by: triggeredBy, transitioned_at: new Date().toISOString(), created_at: new Date().toISOString() }); return { success: true, data: { state: initialState } } } const { data: transition } = await supabase.from('state_transitions').select('*, to_state:to_state_id(*)').eq('from_state_id', currentStateId).eq('event_name', eventName).eq('is_active', true).single(); if (!transition) return { success: false, error: 'Transition not allowed' }; await supabase.from('state_history').insert({ entity_type: entityType, entity_id: entityId, machine_id: machineId, state_id: transition.to_state_id, from_state_id: currentStateId, event_name: eventName, context, triggered_by: triggeredBy, transitioned_at: new Date().toISOString(), created_at: new Date().toISOString() }); await processStateTriggers(transition.to_state_id, entityType, entityId, context); return { success: true, data: { from: currentHistory.states, to: transition.to_state } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function processStateTriggers(stateId: string, entityType: string, entityId: string, context?: any) {
  const supabase = await createClient()
  const { data: triggers } = await supabase.from('state_triggers').select('*').eq('state_id', stateId).eq('is_active', true)
  // Triggers would be processed here based on their action_type
}

export async function getStateHistory(entityType: string, entityId: string, machineId?: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('state_history').select('*, states(*), from_state:from_state_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (machineId) query = query.eq('machine_id', machineId); const { data, error } = await query.order('transitioned_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCurrentState(entityType: string, entityId: string, machineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('state_history').select('*, states(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('machine_id', machineId).order('transitioned_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.states || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

