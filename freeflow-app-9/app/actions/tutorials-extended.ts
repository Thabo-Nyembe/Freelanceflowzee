'use server'

/**
 * Extended Tutorials Server Actions
 * Tables: tutorials, tutorial_steps, tutorial_progress, tutorial_completions, tutorial_bookmarks, tutorial_ratings
 */

import { createClient } from '@/lib/supabase/server'

export async function getTutorial(tutorialId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorials').select('*, tutorial_steps(*), users(*)').eq('id', tutorialId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTutorial(tutorialData: { title: string; description?: string; category?: string; difficulty?: string; duration_minutes?: number; thumbnail_url?: string; is_published?: boolean; is_featured?: boolean; author_id: string; tags?: string[]; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorials').insert({ ...tutorialData, view_count: 0, completion_count: 0, is_published: tutorialData.is_published ?? false, is_featured: tutorialData.is_featured ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTutorial(tutorialId: string, updates: Partial<{ title: string; description: string; category: string; difficulty: string; duration_minutes: number; thumbnail_url: string; is_published: boolean; is_featured: boolean; tags: string[]; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorials').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tutorialId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTutorial(tutorialId: string) {
  try { const supabase = await createClient(); await supabase.from('tutorial_steps').delete().eq('tutorial_id', tutorialId); await supabase.from('tutorial_progress').delete().eq('tutorial_id', tutorialId); await supabase.from('tutorial_completions').delete().eq('tutorial_id', tutorialId); await supabase.from('tutorial_bookmarks').delete().eq('tutorial_id', tutorialId); await supabase.from('tutorial_ratings').delete().eq('tutorial_id', tutorialId); const { error } = await supabase.from('tutorials').delete().eq('id', tutorialId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTutorials(options?: { category?: string; difficulty?: string; is_published?: boolean; is_featured?: boolean; author_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tutorials').select('*, tutorial_steps(count), users(*)'); if (options?.category) query = query.eq('category', options.category); if (options?.difficulty) query = query.eq('difficulty', options.difficulty); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.is_featured !== undefined) query = query.eq('is_featured', options.is_featured); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addStep(tutorialId: string, stepData: { title: string; content: string; order_index?: number; step_type?: string; duration_seconds?: number; media_url?: string; code_snippet?: string }) {
  try { const supabase = await createClient(); const { data: maxOrder } = await supabase.from('tutorial_steps').select('order_index').eq('tutorial_id', tutorialId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = stepData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('tutorial_steps').insert({ tutorial_id: tutorialId, ...stepData, order_index: orderIndex, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStep(stepId: string, updates: Partial<{ title: string; content: string; order_index: number; step_type: string; duration_seconds: number; media_url: string; code_snippet: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_steps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stepId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeStep(stepId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tutorial_steps').delete().eq('id', stepId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSteps(tutorialId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_steps').select('*').eq('tutorial_id', tutorialId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startTutorial(tutorialId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('tutorial_progress').select('id').eq('tutorial_id', tutorialId).eq('user_id', userId).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('tutorial_progress').insert({ tutorial_id: tutorialId, user_id: userId, current_step: 0, progress_percentage: 0, started_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('tutorials').update({ view_count: supabase.rpc('increment_count', { row_id: tutorialId, count_column: 'view_count' }) }).eq('id', tutorialId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProgress(tutorialId: string, userId: string, currentStep: number, progressPercentage: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_progress').update({ current_step: currentStep, progress_percentage: progressPercentage, last_accessed_at: new Date().toISOString() }).eq('tutorial_id', tutorialId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeTutorial(tutorialId: string, userId: string) {
  try { const supabase = await createClient(); await supabase.from('tutorial_progress').update({ progress_percentage: 100, completed_at: new Date().toISOString() }).eq('tutorial_id', tutorialId).eq('user_id', userId); const { data, error } = await supabase.from('tutorial_completions').insert({ tutorial_id: tutorialId, user_id: userId, completed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error && error.code !== '23505') throw error; await supabase.from('tutorials').update({ completion_count: supabase.rpc('increment_count', { row_id: tutorialId, count_column: 'completion_count' }) }).eq('id', tutorialId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProgress(tutorialId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_progress').select('*').eq('tutorial_id', tutorialId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function bookmarkTutorial(tutorialId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_bookmarks').insert({ tutorial_id: tutorialId, user_id: userId, created_at: new Date().toISOString() }).select().single(); if (error && error.code !== '23505') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeBookmark(tutorialId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tutorial_bookmarks').delete().eq('tutorial_id', tutorialId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rateTutorial(tutorialId: string, userId: string, rating: number, review?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('tutorial_ratings').select('id').eq('tutorial_id', tutorialId).eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('tutorial_ratings').update({ rating, review, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('tutorial_ratings').insert({ tutorial_id: tutorialId, user_id: userId, rating, review, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookmarks(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_bookmarks').select('*, tutorials(*)').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRatings(tutorialId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tutorial_ratings').select('*, users(*)').eq('tutorial_id', tutorialId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; const ratings = data || []; const average = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0; return { success: true, data: { ratings, average: Math.round(average * 10) / 10, count: ratings.length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
