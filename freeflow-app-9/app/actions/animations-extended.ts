'use server'

/**
 * Extended Animations Server Actions
 * Tables: animations, animation_presets, animation_keyframes
 */

import { createClient } from '@/lib/supabase/server'

export async function getAnimation(animationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('animations').select('*, animation_keyframes(*)').eq('id', animationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAnimation(animationData: { user_id: string; name: string; description?: string; type?: string; duration?: number; easing?: string; keyframes?: any[]; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('animations').insert({ ...animationData, duration: animationData.duration || 1000, easing: animationData.easing || 'ease', is_public: animationData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAnimation(animationId: string, updates: Partial<{ name: string; description: string; type: string; duration: number; easing: string; keyframes: any[]; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('animations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', animationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAnimation(animationId: string) {
  try { const supabase = await createClient(); await supabase.from('animation_keyframes').delete().eq('animation_id', animationId); const { error } = await supabase.from('animations').delete().eq('id', animationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnimations(options?: { user_id?: string; type?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('animations').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnimationPresets(options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('animation_presets').select('*'); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateAnimation(animationId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('animations').select('*').eq('id', animationId).single(); if (!original) return { success: false, error: 'Animation not found' }; const { data, error } = await supabase.from('animations').insert({ ...original, id: undefined, user_id: userId, name: `${original.name} (Copy)`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
