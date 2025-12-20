'use server'

/**
 * Extended Social Server Actions - Covers all Social-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSocialConnections(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_connections').select('*').eq('user_id', userId).order('connected_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSocialConnection(userId: string, input: { platform: string; platform_user_id: string; platform_username?: string; access_token: string; refresh_token?: string; token_expires_at?: string; profile_data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_connections').insert({ user_id: userId, ...input, connected_at: new Date().toISOString(), is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSocialConnectionTokens(connectionId: string, tokens: { access_token: string; refresh_token?: string; token_expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_connections').update({ ...tokens, updated_at: new Date().toISOString() }).eq('id', connectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disconnectSocialConnection(connectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_connections').update({ is_active: false, disconnected_at: new Date().toISOString() }).eq('id', connectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSocialConnection(connectionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('social_connections').delete().eq('id', connectionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSocialPosts(userId: string, platform?: string) {
  try { const supabase = await createClient(); let query = supabase.from('social_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (platform) query = query.eq('platform', platform); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSocialPost(userId: string, input: { platform: string; content: string; media_urls?: string[]; scheduled_for?: string; connection_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_posts').insert({ user_id: userId, ...input, status: input.scheduled_for ? 'scheduled' : 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishSocialPost(postId: string, platformPostId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_posts').update({ status: 'published', published_at: new Date().toISOString(), platform_post_id: platformPostId }).eq('id', postId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSocialPost(postId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_posts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', postId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSocialPost(postId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('social_posts').delete().eq('id', postId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSocialAnalytics(postId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_analytics').select('*').eq('post_id', postId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSocialAnalytics(postId: string, metrics: { likes?: number; shares?: number; comments?: number; impressions?: number; reach?: number; engagement_rate?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('social_analytics').upsert({ post_id: postId, ...metrics, updated_at: new Date().toISOString() }, { onConflict: 'post_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSocialAnalyticsSummary(userId: string, platform?: string) {
  try { const supabase = await createClient(); let query = supabase.from('social_posts').select('id, platform, social_analytics(*)').eq('user_id', userId); if (platform) query = query.eq('platform', platform); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
