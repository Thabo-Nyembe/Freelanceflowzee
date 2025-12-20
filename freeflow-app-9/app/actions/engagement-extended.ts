'use server'

/**
 * Extended Engagement Server Actions
 * Tables: engagement_metrics, engagement_campaigns, engagement_events, engagement_scores, engagement_surveys
 */

import { createClient } from '@/lib/supabase/server'

export async function getEngagementMetrics(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('engagement_metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEngagementMetrics(entityId: string, entityType: string, metrics: Partial<{ views: number; clicks: number; shares: number; likes: number; comments: number; time_spent_seconds: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('engagement_metrics').upsert({ entity_id: entityId, entity_type: entityType, ...metrics, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementEngagementMetric(entityId: string, entityType: string, metric: string, amount?: number) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('engagement_metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).single(); const currentValue = existing?.[metric] || 0; const { data, error } = await supabase.from('engagement_metrics').upsert({ entity_id: entityId, entity_type: entityType, [metric]: currentValue + (amount || 1), updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEngagementCampaign(campaignData: { name: string; description?: string; type: string; target_audience?: any; start_date: string; end_date?: string; goals?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('engagement_campaigns').insert({ ...campaignData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEngagementCampaigns(options?: { status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('engagement_campaigns').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackEngagementEvent(eventData: { user_id?: string; session_id?: string; event_type: string; entity_id?: string; entity_type?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('engagement_events').insert({ ...eventData, occurred_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEngagementEvents(options?: { user_id?: string; event_type?: string; entity_id?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('engagement_events').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.event_type) query = query.eq('event_type', options.event_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.date_from) query = query.gte('occurred_at', options.date_from); if (options?.date_to) query = query.lte('occurred_at', options.date_to); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function calculateEngagementScore(userId: string) {
  try { const supabase = await createClient(); const { data: events } = await supabase.from('engagement_events').select('event_type').eq('user_id', userId).gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); const score = events?.reduce((s, e) => { const weights: Record<string, number> = { view: 1, click: 2, like: 3, comment: 5, share: 10 }; return s + (weights[e.event_type] || 1) }, 0) || 0; const { data, error } = await supabase.from('engagement_scores').upsert({ user_id: userId, score, calculated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEngagementSurvey(surveyData: { title: string; description?: string; questions: any; target_audience?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('engagement_surveys').insert({ ...surveyData, status: 'draft', response_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitSurveyResponse(responseData: { survey_id: string; user_id?: string; answers: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('engagement_survey_responses').insert({ ...responseData, submitted_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_survey_responses', { survey_id: responseData.survey_id }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
