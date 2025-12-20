'use server'

/**
 * Extended Terms Server Actions
 * Tables: terms, term_versions, term_acceptances, term_categories, term_translations, term_requirements
 */

import { createClient } from '@/lib/supabase/server'

export async function getTerm(termId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('terms').select('*, term_versions(*), term_categories(*), term_translations(*), term_requirements(*)').eq('id', termId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTerm(termData: { title: string; slug: string; content: string; term_type: string; category_id?: string; effective_from?: string; is_required?: boolean; requires_acceptance?: boolean; created_by: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: term, error: termError } = await supabase.from('terms').insert({ ...termData, version: 1, is_required: termData.is_required ?? false, requires_acceptance: termData.requires_acceptance ?? true, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (termError) throw termError; await supabase.from('term_versions').insert({ term_id: term.id, version: 1, content: termData.content, created_by: termData.created_by, created_at: new Date().toISOString() }); return { success: true, data: term } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTerm(termId: string, updates: Partial<{ title: string; content: string; category_id: string; effective_from: string; is_required: boolean; requires_acceptance: boolean; status: string; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const createNewVersion = !!updates.content; let newVersion = 1; if (createNewVersion) { const { data: current } = await supabase.from('terms').select('version, content').eq('id', termId).single(); newVersion = (current?.version || 0) + 1; await supabase.from('term_versions').insert({ term_id: termId, version: newVersion, content: updates.content, created_by: userId, created_at: new Date().toISOString() }) } const { data, error } = await supabase.from('terms').update({ ...updates, version: createNewVersion ? newVersion : undefined, updated_at: new Date().toISOString() }).eq('id', termId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTerm(termId: string) {
  try { const supabase = await createClient(); await supabase.from('term_versions').delete().eq('term_id', termId); await supabase.from('term_acceptances').delete().eq('term_id', termId); await supabase.from('term_translations').delete().eq('term_id', termId); await supabase.from('term_requirements').delete().eq('term_id', termId); const { error } = await supabase.from('terms').delete().eq('id', termId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTerms(options?: { term_type?: string; category_id?: string; status?: string; is_required?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('terms').select('*, term_categories(*)'); if (options?.term_type) query = query.eq('term_type', options.term_type); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_required !== undefined) query = query.eq('is_required', options.is_required); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('title', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishTerm(termId: string, effectiveFrom?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('terms').update({ status: 'published', effective_from: effectiveFrom || new Date().toISOString(), published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', termId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptTerm(termId: string, userId: string, acceptedVersion?: number, metadata?: any) {
  try { const supabase = await createClient(); const { data: term } = await supabase.from('terms').select('version').eq('id', termId).single(); const version = acceptedVersion || term?.version || 1; const { data: existing } = await supabase.from('term_acceptances').select('id').eq('term_id', termId).eq('user_id', userId).eq('version', version).single(); if (existing) return { success: true, data: existing, message: 'Already accepted' }; const { data, error } = await supabase.from('term_acceptances').insert({ term_id: termId, user_id: userId, version, accepted_at: new Date().toISOString(), ip_address: metadata?.ip_address, user_agent: metadata?.user_agent, metadata, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkAcceptance(termId: string, userId: string) {
  try { const supabase = await createClient(); const { data: term } = await supabase.from('terms').select('version').eq('id', termId).single(); const { data: acceptance } = await supabase.from('term_acceptances').select('*').eq('term_id', termId).eq('user_id', userId).order('version', { ascending: false }).limit(1).single(); const isAccepted = acceptance && acceptance.version >= (term?.version || 1); return { success: true, data: { isAccepted, acceptance, currentVersion: term?.version, acceptedVersion: acceptance?.version } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAcceptances(termId: string, options?: { version?: number; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('term_acceptances').select('*, users(*)').eq('term_id', termId); if (options?.version) query = query.eq('version', options.version); if (options?.from_date) query = query.gte('accepted_at', options.from_date); if (options?.to_date) query = query.lte('accepted_at', options.to_date); const { data, error } = await query.order('accepted_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVersions(termId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('term_versions').select('*, users(*)').eq('term_id', termId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTranslation(termId: string, locale: string, title: string, content: string, translatedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('term_translations').upsert({ term_id: termId, locale, title, content, translated_by: translatedBy, updated_at: new Date().toISOString() }, { onConflict: 'term_id,locale' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslations(termId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('term_translations').select('*').eq('term_id', termId).order('locale', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRequiredTerms(userId: string, context?: { entity_type?: string; entity_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('terms').select('*').eq('status', 'published').eq('requires_acceptance', true).lte('effective_from', new Date().toISOString()); const { data: terms } = await query.order('title', { ascending: true }); if (!terms || terms.length === 0) return { success: true, data: [] }; const termIds = terms.map(t => t.id); const { data: acceptances } = await supabase.from('term_acceptances').select('term_id, version').eq('user_id', userId).in('term_id', termIds); const acceptedMap = new Map(acceptances?.map(a => [a.term_id, a.version]) || []); const pending = terms.filter(t => { const acceptedVersion = acceptedMap.get(t.id); return !acceptedVersion || acceptedVersion < t.version }); return { success: true, data: pending } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('term_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
