'use server'

/**
 * Extended Template Server Actions - Covers all 8 Template-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTemplateDeliverables(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_deliverables').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTemplateDeliverable(templateId: string, input: { name: string; description?: string; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_deliverables').insert({ template_id: templateId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTemplateDeliverable(deliverableId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_deliverables').update(updates).eq('id', deliverableId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTemplateDeliverable(deliverableId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('template_deliverables').delete().eq('id', deliverableId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplateFavorites(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleTemplateFavorite(userId: string, templateId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase.from('template_favorites').select('id').eq('user_id', userId).eq('template_id', templateId).single()
    if (existing) {
      await supabase.from('template_favorites').delete().eq('id', existing.id)
      return { success: true, favorited: false }
    } else {
      await supabase.from('template_favorites').insert({ user_id: userId, template_id: templateId })
      return { success: true, favorited: true }
    }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplateItems(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_items').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTemplateItem(templateId: string, input: { name: string; type: string; config?: any; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_items').insert({ template_id: templateId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTemplateItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_items').update(updates).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTemplateItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('template_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplateMilestones(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_milestones').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTemplateMilestone(templateId: string, input: { name: string; description?: string; days_offset?: number; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_milestones').insert({ template_id: templateId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTemplateMilestone(milestoneId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_milestones').update(updates).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplatePricing(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_pricing').select('*').eq('template_id', templateId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setTemplatePricing(templateId: string, input: { tier: string; price: number; currency?: string; features?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_pricing').upsert({ template_id: templateId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplateRatings(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_ratings').select('*').eq('template_id', templateId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function rateTemplate(templateId: string, userId: string, rating: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_ratings').upsert({ template_id: templateId, user_id: userId, rating }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplateReviews(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_reviews').select('*').eq('template_id', templateId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTemplateReview(templateId: string, userId: string, rating: number, review: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_reviews').insert({ template_id: templateId, user_id: userId, rating, review }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTemplateReview(reviewId: string, rating: number, review: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_reviews').update({ rating, review, updated_at: new Date().toISOString() }).eq('id', reviewId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTemplateReview(reviewId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('template_reviews').delete().eq('id', reviewId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplateTasks(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_tasks').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTemplateTask(templateId: string, input: { name: string; description?: string; estimated_hours?: number; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_tasks').insert({ template_id: templateId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTemplateTask(taskId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_tasks').update(updates).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTemplateTask(taskId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('template_tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
