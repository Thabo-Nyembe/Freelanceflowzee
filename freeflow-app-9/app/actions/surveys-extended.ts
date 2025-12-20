'use server'

/**
 * Extended Surveys Server Actions
 * Tables: surveys, survey_questions, survey_responses, survey_answers, survey_analytics, survey_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getSurvey(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').select('*, survey_questions(*)').eq('id', surveyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSurvey(surveyData: { title: string; description?: string; survey_type?: string; category?: string; questions?: any[]; settings?: any; start_date?: string; end_date?: string; created_by?: string; is_anonymous?: boolean; is_public?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { questions, ...surveyInfo } = surveyData; const { data: survey, error: surveyError } = await supabase.from('surveys').insert({ ...surveyInfo, status: 'draft', is_anonymous: surveyInfo.is_anonymous ?? false, is_public: surveyInfo.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (surveyError) throw surveyError; if (questions && questions.length > 0) { const questionsData = questions.map((q, i) => ({ survey_id: survey.id, ...q, order_index: i, created_at: new Date().toISOString() })); await supabase.from('survey_questions').insert(questionsData) } return { success: true, data: survey } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSurvey(surveyId: string, updates: Partial<{ title: string; description: string; settings: any; start_date: string; end_date: string; status: string; is_anonymous: boolean; is_public: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', surveyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSurvey(surveyId: string) {
  try { const supabase = await createClient(); await supabase.from('survey_answers').delete().eq('survey_id', surveyId); await supabase.from('survey_responses').delete().eq('survey_id', surveyId); await supabase.from('survey_questions').delete().eq('survey_id', surveyId); const { error } = await supabase.from('surveys').delete().eq('id', surveyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSurveys(options?: { survey_type?: string; category?: string; status?: string; created_by?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('surveys').select('*, survey_questions(count), survey_responses(count)'); if (options?.survey_type) query = query.eq('survey_type', options.survey_type); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addQuestion(surveyId: string, questionData: { question_text: string; question_type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'scale' | 'date'; options?: any[]; is_required?: boolean; order_index?: number; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_questions').insert({ survey_id: surveyId, ...questionData, is_required: questionData.is_required ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateQuestion(questionId: string, updates: Partial<{ question_text: string; question_type: string; options: any[]; is_required: boolean; order_index: number; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_questions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', questionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteQuestion(questionId: string) {
  try { const supabase = await createClient(); await supabase.from('survey_answers').delete().eq('question_id', questionId); const { error } = await supabase.from('survey_questions').delete().eq('id', questionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQuestions(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('survey_questions').select('*').eq('survey_id', surveyId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitResponse(surveyId: string, responseData: { respondent_id?: string; answers: { question_id: string; answer_value: any }[]; metadata?: any }) {
  try { const supabase = await createClient(); const { answers, ...responseInfo } = responseData; const { data: response, error: responseError } = await supabase.from('survey_responses').insert({ survey_id: surveyId, ...responseInfo, status: 'completed', submitted_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (responseError) throw responseError; if (answers && answers.length > 0) { const answersData = answers.map(a => ({ survey_id: surveyId, response_id: response.id, ...a, created_at: new Date().toISOString() })); await supabase.from('survey_answers').insert(answersData) } await supabase.from('surveys').update({ response_count: supabase.rpc('increment_response_count'), updated_at: new Date().toISOString() }).eq('id', surveyId).catch(() => {}); return { success: true, data: response } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResponses(surveyId: string, options?: { respondent_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('survey_responses').select('*, survey_answers(*), users(*)').eq('survey_id', surveyId); if (options?.respondent_id) query = query.eq('respondent_id', options.respondent_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('submitted_at', options.from_date); if (options?.to_date) query = query.lte('submitted_at', options.to_date); const { data, error } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalytics(surveyId: string) {
  try { const supabase = await createClient(); const [responsesRes, questionsRes] = await Promise.all([
    supabase.from('survey_responses').select('*').eq('survey_id', surveyId),
    supabase.from('survey_questions').select('*, survey_answers(answer_value)').eq('survey_id', surveyId)
  ]); const responses = responsesRes.data || []; const questions = questionsRes.data || []; const questionAnalytics = questions.map(q => { const answers = q.survey_answers || []; const summary: any = { question_id: q.id, question_text: q.question_text, question_type: q.question_type, total_answers: answers.length }; if (q.question_type === 'rating' || q.question_type === 'scale') { const values = answers.map((a: any) => parseFloat(a.answer_value)).filter((v: any) => !isNaN(v)); summary.average = values.length > 0 ? values.reduce((sum: number, v: number) => sum + v, 0) / values.length : 0; summary.min = Math.min(...values); summary.max = Math.max(...values) } else if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') { const counts: Record<string, number> = {}; answers.forEach((a: any) => { const val = Array.isArray(a.answer_value) ? a.answer_value : [a.answer_value]; val.forEach((v: string) => { counts[v] = (counts[v] || 0) + 1 }) }); summary.distribution = counts } return summary }); return { success: true, data: { totalResponses: responses.length, completionRate: responses.length > 0 ? (responses.filter(r => r.status === 'completed').length / responses.length) * 100 : 0, questionAnalytics } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishSurvey(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').update({ status: 'active', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', surveyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeSurvey(surveyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('surveys').update({ status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', surveyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

