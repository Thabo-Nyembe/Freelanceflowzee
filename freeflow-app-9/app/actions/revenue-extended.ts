'use server'

/**
 * Extended Revenue Server Actions - Covers all 4 Revenue-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRevenueAnalytics(userId: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('revenue_analytics').select('*').eq('user_id', userId).order('period_start', { ascending: false }); if (startDate) query = query.gte('period_start', startDate); if (endDate) query = query.lte('period_end', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordRevenueAnalytics(userId: string, input: { period_start: string; period_end: string; total_revenue: number; recurring_revenue?: number; one_time_revenue?: number; growth_rate?: number; metrics?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_analytics').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRevenueForecasts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_forecasts').select('*').eq('user_id', userId).order('period_start', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRevenueForecast(userId: string, input: { period_start: string; period_end: string; predicted_revenue: number; confidence_level?: number; model?: string; assumptions?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_forecasts').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRevenueForecast(forecastId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_forecasts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', forecastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function compareRevenueForecastToActual(forecastId: string, actualRevenue: number) {
  try { const supabase = await createClient(); const variance = actualRevenue; const { data, error } = await supabase.from('revenue_forecasts').update({ actual_revenue: actualRevenue, variance, accuracy_calculated_at: new Date().toISOString() }).eq('id', forecastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRevenueGoals(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRevenueGoal(userId: string, input: { name: string; target_amount: number; current_amount?: number; period_start: string; period_end: string; category?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_goals').insert({ user_id: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRevenueGoal(goalId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRevenueGoalProgress(goalId: string, currentAmount: number) {
  try { const supabase = await createClient(); const { data: goal, error: goalError } = await supabase.from('revenue_goals').select('target_amount').eq('id', goalId).single(); if (goalError) throw goalError; const progress = (currentAmount / goal.target_amount) * 100; const status = progress >= 100 ? 'achieved' : 'active'; const { data, error } = await supabase.from('revenue_goals').update({ current_amount: currentAmount, progress, status, achieved_at: status === 'achieved' ? new Date().toISOString() : null }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRevenueStreams(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_streams').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRevenueStream(userId: string, input: { name: string; type: string; description?: string; is_recurring?: boolean; frequency?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_streams').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRevenueStream(streamId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_streams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordRevenueStreamIncome(streamId: string, amount: number, date?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_streams').update({ last_income_amount: amount, last_income_date: date || new Date().toISOString(), total_income: amount }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateRevenueStream(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revenue_streams').update({ is_active: false }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
