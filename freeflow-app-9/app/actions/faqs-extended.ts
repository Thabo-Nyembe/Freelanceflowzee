'use server'

/**
 * Extended FAQs Server Actions
 * Tables: faqs, faq_categories, faq_feedback, faq_translations
 */

import { createClient } from '@/lib/supabase/server'

export async function getFaq(faqId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('faqs').select('*, faq_categories(*), faq_translations(*)').eq('id', faqId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFaq(faqData: { question: string; answer: string; category_id?: string; order?: number; is_published?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('faqs').insert({ ...faqData, view_count: 0, helpful_count: 0, is_published: faqData.is_published ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFaq(faqId: string, updates: Partial<{ question: string; answer: string; category_id: string; order: number; is_published: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('faqs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', faqId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFaq(faqId: string) {
  try { const supabase = await createClient(); await supabase.from('faq_translations').delete().eq('faq_id', faqId); await supabase.from('faq_feedback').delete().eq('faq_id', faqId); const { error } = await supabase.from('faqs').delete().eq('id', faqId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFaqs(options?: { category_id?: string; is_published?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('faqs').select('*, faq_categories(*)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.search) query = query.or(`question.ilike.%${options.search}%,answer.ilike.%${options.search}%`); const { data, error } = await query.order('order', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFaqCategories(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('faq_categories').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFaqCategory(categoryData: { name: string; description?: string; icon?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('faq_categories').insert({ ...categoryData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementFaqView(faqId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('faqs').select('view_count').eq('id', faqId).single(); const { error } = await supabase.from('faqs').update({ view_count: (data?.view_count || 0) + 1 }).eq('id', faqId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitFaqFeedback(feedbackData: { faq_id: string; user_id?: string; is_helpful: boolean; comment?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('faq_feedback').insert({ ...feedbackData, submitted_at: new Date().toISOString() }).select().single(); if (error) throw error; if (feedbackData.is_helpful) { const { data: faq } = await supabase.from('faqs').select('helpful_count').eq('id', feedbackData.faq_id).single(); await supabase.from('faqs').update({ helpful_count: (faq?.helpful_count || 0) + 1 }).eq('id', feedbackData.faq_id) }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addFaqTranslation(translationData: { faq_id: string; language: string; question: string; answer: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('faq_translations').upsert({ ...translationData, updated_at: new Date().toISOString() }, { onConflict: 'faq_id,language' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchFaqs(query: string, options?: { category_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let q = supabase.from('faqs').select('*, faq_categories(*)').eq('is_published', true).or(`question.ilike.%${query}%,answer.ilike.%${query}%`); if (options?.category_id) q = q.eq('category_id', options.category_id); const { data, error } = await q.order('view_count', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
