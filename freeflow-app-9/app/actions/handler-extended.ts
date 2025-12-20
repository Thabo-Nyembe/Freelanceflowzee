'use server'

/**
 * Extended Handler Server Actions - Covers all Handler-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getHandler(handlerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('handlers').select('*').eq('id', handlerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHandlerByName(name: string, handlerType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('handlers').select('*').eq('name', name); if (handlerType) query = query.eq('handler_type', handlerType); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createHandler(handlerData: { name: string; handler_type: string; event_types: string[]; endpoint_url?: string; handler_function?: string; config?: Record<string, any>; retry_config?: { max_retries: number; retry_delay: number }; timeout?: number; user_id?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('handlers').insert({ ...handlerData, is_active: true, execution_count: 0, failure_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateHandler(handlerId: string, updates: Partial<{ name: string; endpoint_url: string; handler_function: string; config: Record<string, any>; retry_config: { max_retries: number; retry_delay: number }; timeout: number; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('handlers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', handlerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteHandler(handlerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('handlers').delete().eq('id', handlerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateHandler(handlerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('handlers').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', handlerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateHandler(handlerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('handlers').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', handlerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordHandlerExecution(handlerId: string, execution: { event_type: string; status: 'success' | 'failure'; duration_ms: number; error_message?: string; request_payload?: Record<string, any>; response_data?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data: handler } = await supabase.from('handlers').select('execution_count, failure_count').eq('id', handlerId).single(); if (handler) { await supabase.from('handlers').update({ execution_count: handler.execution_count + 1, failure_count: execution.status === 'failure' ? handler.failure_count + 1 : handler.failure_count, last_executed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', handlerId); } await supabase.from('handler_executions').insert({ handler_id: handlerId, ...execution, executed_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHandlersForEvent(eventType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('handlers').select('*').contains('event_types', [eventType]).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserHandlers(userId: string, options?: { isActive?: boolean; handlerType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('handlers').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.handlerType) query = query.eq('handler_type', options.handlerType); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHandlerExecutions(handlerId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('handler_executions').select('*').eq('handler_id', handlerId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function testHandler(handlerId: string, testPayload: Record<string, any>) {
  try { const supabase = await createClient(); const { data: handler } = await supabase.from('handlers').select('*').eq('id', handlerId).single(); if (!handler) return { success: false, error: 'Handler not found' }; return { success: true, handler, testPayload, message: 'Handler test queued' } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
