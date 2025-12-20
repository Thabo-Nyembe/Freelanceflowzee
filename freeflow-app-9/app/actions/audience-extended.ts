'use server'

/**
 * Extended Audience Server Actions
 * Tables: audience_segments, audience_members, audience_rules
 */

import { createClient } from '@/lib/supabase/server'

export async function getAudienceSegment(segmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audience_segments').select('*, audience_rules(*)').eq('id', segmentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAudienceSegment(segmentData: { user_id: string; name: string; description?: string; type?: string; rules?: Record<string, any>[]; is_dynamic?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audience_segments').insert({ ...segmentData, member_count: 0, is_dynamic: segmentData.is_dynamic ?? true, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAudienceSegment(segmentId: string, updates: Partial<{ name: string; description: string; type: string; rules: Record<string, any>[]; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audience_segments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', segmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAudienceSegment(segmentId: string) {
  try { const supabase = await createClient(); await supabase.from('audience_members').delete().eq('segment_id', segmentId); await supabase.from('audience_rules').delete().eq('segment_id', segmentId); const { error } = await supabase.from('audience_segments').delete().eq('id', segmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAudienceSegments(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('audience_segments').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('member_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addAudienceMember(segmentId: string, memberId: string, memberData?: { email?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('audience_members').select('id').eq('segment_id', segmentId).eq('member_id', memberId).single(); if (existing) return { success: false, error: 'Already a member' }; const { data, error } = await supabase.from('audience_members').insert({ segment_id: segmentId, member_id: memberId, ...memberData, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_audience_member_count', { seg_id: segmentId }).catch(() => {}); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeAudienceMember(segmentId: string, memberId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('audience_members').delete().eq('segment_id', segmentId).eq('member_id', memberId); if (error) throw error; await supabase.rpc('decrement_audience_member_count', { seg_id: segmentId }).catch(() => {}); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAudienceMembers(segmentId: string, options?: { limit?: number; offset?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audience_members').select('*').eq('segment_id', segmentId).order('joined_at', { ascending: false }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function syncDynamicAudience(segmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audience_segments').update({ last_synced_at: new Date().toISOString() }).eq('id', segmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAudienceStats(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('audience_segments').select('type, member_count, status').eq('user_id', userId); if (!data) return { success: true, data: { totalSegments: 0, totalMembers: 0, byType: {} } }; const totalSegments = data.length; const totalMembers = data.reduce((sum, s) => sum + (s.member_count || 0), 0); const byType = data.reduce((acc: Record<string, number>, s) => { acc[s.type || 'unknown'] = (acc[s.type || 'unknown'] || 0) + 1; return acc }, {}); return { success: true, data: { totalSegments, totalMembers, byType } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { totalSegments: 0, totalMembers: 0, byType: {} } } }
}
