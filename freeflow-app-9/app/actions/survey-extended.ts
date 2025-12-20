'use server'

/**
 * Extended Survey Server Actions - Covers all Survey-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSurveys(userId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('surveys').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSurvey(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').select('*').eq('id', surveyId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSurvey(input: { user_id: string; title: string; description?: string; survey_type?: string; settings?: any; start_date?: string; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').insert({ ...input, status: 'draft', response_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSurvey(surveyId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', surveyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSurvey(surveyId: string) {
  try { const supabase = await createClient(); await supabase.from('survey_responses').delete().eq('survey_id', surveyId); await supabase.from('survey_questions').delete().eq('survey_id', surveyId); const { error } = await supabase.from('surveys').delete().eq('id', surveyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishSurvey(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').update({ status: 'active', published_at: new Date().toISOString() }).eq('id', surveyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeSurvey(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', surveyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSurveyQuestions(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_questions').select('*').eq('survey_id', surveyId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSurveyQuestion(surveyId: string, question: { question_text: string; question_type: string; options?: any; is_required?: boolean; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_questions').insert({ survey_id: surveyId, ...question }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSurveyQuestion(questionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_questions').update(updates).eq('id', questionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSurveyQuestion(questionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('survey_questions').delete().eq('id', questionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitSurveyResponse(surveyId: string, userId: string, answers: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_responses').insert({ survey_id: surveyId, user_id: userId, answers, completed_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: survey } = await supabase.from('surveys').select('response_count').eq('id', surveyId).single(); await supabase.from('surveys').update({ response_count: (survey?.response_count || 0) + 1 }).eq('id', surveyId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSurveyResponses(surveyId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_responses').select('*').eq('survey_id', surveyId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSurveyAnalytics(surveyId: string) {
  try { const supabase = await createClient(); const { data: responses, error } = await supabase.from('survey_responses').select('answers').eq('survey_id', surveyId); if (error) throw error; const { data: questions } = await supabase.from('survey_questions').select('*').eq('survey_id', surveyId); const analytics = { total_responses: responses?.length || 0, by_question: {} as Record<string, any> }; return { success: true, data: analytics } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
