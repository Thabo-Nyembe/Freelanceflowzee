'use server'

/**
 * Extended Submissions Server Actions
 * Tables: submissions, submission_files, submission_reviews, submission_feedback, submission_versions, submission_scores
 */

import { createClient } from '@/lib/supabase/server'

export async function getSubmission(submissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('submissions').select('*, submission_files(*), submission_reviews(*), submission_versions(*), users(*)').eq('id', submissionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSubmission(submissionData: { assignment_id: string; submitter_id: string; title?: string; content?: string; files?: { file_url: string; file_name: string; file_type: string; file_size: number }[]; metadata?: any }) {
  try { const supabase = await createClient(); const { files, ...submissionInfo } = submissionData; const { data: submission, error: submissionError } = await supabase.from('submissions').insert({ ...submissionInfo, status: 'submitted', version: 1, submitted_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (submissionError) throw submissionError; if (files && files.length > 0) { const filesData = files.map(f => ({ submission_id: submission.id, ...f, uploaded_at: new Date().toISOString(), created_at: new Date().toISOString() })); await supabase.from('submission_files').insert(filesData) } return { success: true, data: submission } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubmission(submissionId: string, updates: Partial<{ title: string; content: string; status: string; metadata: any }>, createVersion: boolean = true) {
  try { const supabase = await createClient(); if (createVersion) { const { data: current } = await supabase.from('submissions').select('*').eq('id', submissionId).single(); if (current) { await supabase.from('submission_versions').insert({ submission_id: submissionId, version: current.version, content: current.content, snapshot: current, created_at: new Date().toISOString() }) } } const { data: submission } = await supabase.from('submissions').select('version').eq('id', submissionId).single(); const { data, error } = await supabase.from('submissions').update({ ...updates, version: (submission?.version || 0) + 1, updated_at: new Date().toISOString() }).eq('id', submissionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSubmission(submissionId: string) {
  try { const supabase = await createClient(); await supabase.from('submission_files').delete().eq('submission_id', submissionId); await supabase.from('submission_reviews').delete().eq('submission_id', submissionId); await supabase.from('submission_versions').delete().eq('submission_id', submissionId); const { error } = await supabase.from('submissions').delete().eq('id', submissionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubmissions(options?: { assignment_id?: string; submitter_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('submissions').select('*, submission_files(count), submission_reviews(count), users(*)'); if (options?.assignment_id) query = query.eq('assignment_id', options.assignment_id); if (options?.submitter_id) query = query.eq('submitter_id', options.submitter_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('submitted_at', options.from_date); if (options?.to_date) query = query.lte('submitted_at', options.to_date); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFile(submissionId: string, fileData: { file_url: string; file_name: string; file_type: string; file_size: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('submission_files').insert({ submission_id: submissionId, ...fileData, uploaded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeFile(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('submission_files').delete().eq('id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReview(submissionId: string, reviewData: { reviewer_id: string; review_type?: string; status: 'approved' | 'rejected' | 'needs_revision'; comments?: string; scores?: { criteria: string; score: number; max_score: number }[] }) {
  try { const supabase = await createClient(); const { scores, ...reviewInfo } = reviewData; const { data: review, error: reviewError } = await supabase.from('submission_reviews').insert({ submission_id: submissionId, ...reviewInfo, reviewed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (reviewError) throw reviewError; if (scores && scores.length > 0) { const scoresData = scores.map(s => ({ submission_id: submissionId, review_id: review.id, ...s, created_at: new Date().toISOString() })); await supabase.from('submission_scores').insert(scoresData) } await supabase.from('submissions').update({ status: reviewData.status === 'approved' ? 'approved' : reviewData.status === 'rejected' ? 'rejected' : 'revision_requested', updated_at: new Date().toISOString() }).eq('id', submissionId); return { success: true, data: review } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviews(submissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('submission_reviews').select('*, users(*), submission_scores(*)').eq('submission_id', submissionId).order('reviewed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFeedback(submissionId: string, feedbackData: { feedback_by: string; feedback_type?: string; content: string; is_private?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('submission_feedback').insert({ submission_id: submissionId, ...feedbackData, is_private: feedbackData.is_private ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeedback(submissionId: string, options?: { include_private?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('submission_feedback').select('*, users(*)').eq('submission_id', submissionId); if (!options?.include_private) query = query.eq('is_private', false); const { data, error } = await query.order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVersions(submissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('submission_versions').select('*').eq('submission_id', submissionId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function revertToVersion(submissionId: string, version: number) {
  try { const supabase = await createClient(); const { data: versionData } = await supabase.from('submission_versions').select('*').eq('submission_id', submissionId).eq('version', version).single(); if (!versionData) return { success: false, error: 'Version not found' }; const { data, error } = await supabase.from('submissions').update({ content: versionData.content, updated_at: new Date().toISOString() }).eq('id', submissionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScores(submissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('submission_scores').select('*').eq('submission_id', submissionId); if (error) throw error; const scores = data || []; const totalScore = scores.reduce((sum, s) => sum + s.score, 0); const maxScore = scores.reduce((sum, s) => sum + s.max_score, 0); return { success: true, data: { scores, totalScore, maxScore, percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

