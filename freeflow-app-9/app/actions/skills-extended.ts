'use server'

/**
 * Extended Skills Server Actions
 * Tables: skills, skill_categories, skill_levels, skill_assessments, skill_endorsements, skill_requirements
 */

import { createClient } from '@/lib/supabase/server'

export async function getSkill(skillId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('skills').select('*, skill_categories(*), skill_levels(*)').eq('id', skillId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSkill(skillData: { name: string; description?: string; category_id?: string; type?: string; is_technical?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('skills').insert({ ...skillData, is_active: skillData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSkill(skillId: string, updates: Partial<{ name: string; description: string; category_id: string; type: string; is_technical: boolean; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('skills').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', skillId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSkill(skillId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('skills').delete().eq('id', skillId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSkills(options?: { category_id?: string; type?: string; is_technical?: boolean; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('skills').select('*, skill_categories(*), skill_levels(count)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.type) query = query.eq('type', options.type); if (options?.is_technical !== undefined) query = query.eq('is_technical', options.is_technical); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUserSkill(userId: string, skillId: string, level: number, yearsExperience?: number, isCertified?: boolean) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_skills').select('id').eq('user_id', userId).eq('skill_id', skillId).single(); if (existing) { const { data, error } = await supabase.from('user_skills').update({ level, years_experience: yearsExperience, is_certified: isCertified, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('user_skills').insert({ user_id: userId, skill_id: skillId, level, years_experience: yearsExperience, is_certified: isCertified, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeUserSkill(userId: string, skillId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_skills').delete().eq('user_id', userId).eq('skill_id', skillId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserSkills(userId: string, options?: { category_id?: string; min_level?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('user_skills').select('*, skills(*, skill_categories(*))').eq('user_id', userId); if (options?.min_level) query = query.gte('level', options.min_level); const { data, error } = await query.order('level', { ascending: false }); if (error) throw error; let skills = data || []; if (options?.category_id) { skills = skills.filter(s => s.skills?.category_id === options.category_id) } return { success: true, data: skills } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assessSkill(assessmentData: { user_id: string; skill_id: string; assessor_id?: string; assessment_type: string; score: number; max_score?: number; level_achieved?: number; notes?: string; evidence_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('skill_assessments').insert({ ...assessmentData, assessed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (assessmentData.level_achieved) { await addUserSkill(assessmentData.user_id, assessmentData.skill_id, assessmentData.level_achieved) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSkillAssessments(userId: string, skillId?: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('skill_assessments').select('*, skills(*), users(*)').eq('user_id', userId); if (skillId) query = query.eq('skill_id', skillId); const { data, error } = await query.order('assessed_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function endorseSkill(userId: string, skillId: string, endorserId: string, comment?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('skill_endorsements').select('id').eq('user_id', userId).eq('skill_id', skillId).eq('endorser_id', endorserId).single(); if (existing) return { success: false, error: 'Already endorsed' }; const { data, error } = await supabase.from('skill_endorsements').insert({ user_id: userId, skill_id: skillId, endorser_id: endorserId, comment, endorsed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSkillEndorsements(userId: string, skillId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('skill_endorsements').select('*, skills(*), endorser:endorser_id(*)').eq('user_id', userId); if (skillId) query = query.eq('skill_id', skillId); const { data, error } = await query.order('endorsed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSkillCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('skill_categories').select('*, skills(count)'); if (options?.parent_id !== undefined) { if (options.parent_id === null) query = query.is('parent_id', null); else query = query.eq('parent_id', options.parent_id) } if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSkillLevels() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('skill_levels').select('*').order('level', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSkillRequirements(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('skill_requirements').select('*, skills(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function findUsersWithSkills(skillIds: string[], options?: { min_level?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('user_skills').select('user_id, level, skills(*), users(*)').in('skill_id', skillIds); if (options?.min_level) query = query.gte('level', options.min_level); const { data, error } = await query.order('level', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

