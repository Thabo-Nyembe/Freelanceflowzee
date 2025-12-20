'use server'

/**
 * Extended Tracks Server Actions
 * Tables: tracks, track_items, track_progress, track_completions, track_enrollments, track_certificates
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrack(trackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tracks').select('*, track_items(*, courses(*), lessons(*)), track_enrollments(count)').eq('id', trackId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrack(trackData: { name: string; slug: string; description?: string; track_type?: string; category?: string; difficulty?: string; duration_hours?: number; created_by: string; cover_url?: string; is_public?: boolean; price?: number; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tracks').insert({ ...trackData, track_type: trackData.track_type || 'learning_path', difficulty: trackData.difficulty || 'beginner', is_public: trackData.is_public ?? true, status: 'draft', item_count: 0, enrollment_count: 0, completion_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrack(trackId: string, updates: Partial<{ name: string; description: string; track_type: string; category: string; difficulty: string; duration_hours: number; cover_url: string; is_public: boolean; status: string; price: number; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tracks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', trackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTrack(trackId: string) {
  try { const supabase = await createClient(); await supabase.from('track_items').delete().eq('track_id', trackId); await supabase.from('track_progress').delete().eq('track_id', trackId); await supabase.from('track_completions').delete().eq('track_id', trackId); await supabase.from('track_enrollments').delete().eq('track_id', trackId); await supabase.from('track_certificates').delete().eq('track_id', trackId); const { error } = await supabase.from('tracks').delete().eq('id', trackId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTracks(options?: { track_type?: string; category?: string; difficulty?: string; status?: string; is_public?: boolean; created_by?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tracks').select('*, track_items(count)'); if (options?.track_type) query = query.eq('track_type', options.track_type); if (options?.category) query = query.eq('category', options.category); if (options?.difficulty) query = query.eq('difficulty', options.difficulty); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(trackId: string, itemData: { item_type: string; item_id: string; title: string; description?: string; duration_minutes?: number; order_index?: number; is_required?: boolean }) {
  try { const supabase = await createClient(); const { data: maxOrder } = await supabase.from('track_items').select('order_index').eq('track_id', trackId).order('order_index', { ascending: false }).limit(1).single(); const orderIndex = itemData.order_index ?? ((maxOrder?.order_index || 0) + 1); const { data, error } = await supabase.from('track_items').insert({ track_id: trackId, ...itemData, order_index: orderIndex, is_required: itemData.is_required ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await updateItemCount(trackId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('track_items').select('track_id').eq('id', itemId).single(); const { error } = await supabase.from('track_items').delete().eq('id', itemId); if (error) throw error; if (item?.track_id) await updateItemCount(item.track_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderItems(trackId: string, itemOrders: { id: string; order_index: number }[]) {
  try { const supabase = await createClient(); for (const item of itemOrders) { await supabase.from('track_items').update({ order_index: item.order_index, updated_at: new Date().toISOString() }).eq('id', item.id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateItemCount(trackId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('track_items').select('*', { count: 'exact', head: true }).eq('track_id', trackId)
  const { data: items } = await supabase.from('track_items').select('duration_minutes').eq('track_id', trackId)
  const totalMinutes = items?.reduce((sum, i) => sum + (i.duration_minutes || 0), 0) || 0
  await supabase.from('tracks').update({ item_count: count || 0, duration_hours: Math.round(totalMinutes / 60 * 10) / 10, updated_at: new Date().toISOString() }).eq('id', trackId)
}

export async function getItems(trackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('track_items').select('*, courses(*), lessons(*)').eq('track_id', trackId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function enrollUser(trackId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('track_enrollments').select('id').eq('track_id', trackId).eq('user_id', userId).single(); if (existing) return { success: false, error: 'Already enrolled' }; const { data, error } = await supabase.from('track_enrollments').insert({ track_id: trackId, user_id: userId, status: 'enrolled', enrolled_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('tracks').update({ enrollment_count: supabase.rpc('increment_count', { row_id: trackId, count_column: 'enrollment_count' }) }).eq('id', trackId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unenrollUser(enrollmentId: string) {
  try { const supabase = await createClient(); const { data: enrollment } = await supabase.from('track_enrollments').select('track_id').eq('id', enrollmentId).single(); const { error } = await supabase.from('track_enrollments').delete().eq('id', enrollmentId); if (error) throw error; if (enrollment?.track_id) { await supabase.rpc('decrement_count', { row_id: enrollment.track_id, table_name: 'tracks', count_column: 'enrollment_count' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProgress(trackId: string, userId: string, itemId: string, progressData: { status: string; progress_percent?: number; time_spent_minutes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('track_progress').upsert({ track_id: trackId, user_id: userId, item_id: itemId, status: progressData.status, progress_percent: progressData.progress_percent || (progressData.status === 'completed' ? 100 : 0), time_spent_minutes: progressData.time_spent_minutes || 0, completed_at: progressData.status === 'completed' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: 'track_id,user_id,item_id' }).select().single(); if (error) throw error; await checkTrackCompletion(trackId, userId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function checkTrackCompletion(trackId: string, userId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase.from('track_items').select('id').eq('track_id', trackId).eq('is_required', true)
  const { data: progress } = await supabase.from('track_progress').select('item_id, status').eq('track_id', trackId).eq('user_id', userId).eq('status', 'completed')
  const completedIds = progress?.map(p => p.item_id) || []
  const allCompleted = items?.every(i => completedIds.includes(i.id))
  if (allCompleted && items && items.length > 0) {
    const { data: existing } = await supabase.from('track_completions').select('id').eq('track_id', trackId).eq('user_id', userId).single()
    if (!existing) {
      await supabase.from('track_completions').insert({ track_id: trackId, user_id: userId, completed_at: new Date().toISOString(), created_at: new Date().toISOString() })
      await supabase.from('tracks').update({ completion_count: supabase.rpc('increment_count', { row_id: trackId, count_column: 'completion_count' }) }).eq('id', trackId)
      await supabase.from('track_enrollments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('track_id', trackId).eq('user_id', userId)
    }
  }
}

export async function getProgress(trackId: string, userId: string) {
  try { const supabase = await createClient(); const { data: items } = await supabase.from('track_items').select('id, is_required').eq('track_id', trackId); const { data: progress } = await supabase.from('track_progress').select('*').eq('track_id', trackId).eq('user_id', userId); const completedCount = progress?.filter(p => p.status === 'completed').length || 0; const requiredItems = items?.filter(i => i.is_required).length || 0; const overallProgress = requiredItems > 0 ? (completedCount / requiredItems) * 100 : 0; return { success: true, data: { progress: progress || [], completedCount, totalItems: items?.length || 0, requiredItems, overallProgress: Math.round(overallProgress) } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function issueCertificate(trackId: string, userId: string, certificateData?: { certificate_number?: string; issued_by?: string }) {
  try { const supabase = await createClient(); const { data: completion } = await supabase.from('track_completions').select('id').eq('track_id', trackId).eq('user_id', userId).single(); if (!completion) return { success: false, error: 'Track not completed' }; const certificateNumber = certificateData?.certificate_number || `CERT-${Date.now()}`; const { data, error } = await supabase.from('track_certificates').insert({ track_id: trackId, user_id: userId, certificate_number: certificateNumber, issued_by: certificateData?.issued_by, issued_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCertificates(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('track_certificates').select('*, tracks(*)').eq('user_id', userId).order('issued_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserEnrollments(userId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('track_enrollments').select('*, tracks(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('enrolled_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
