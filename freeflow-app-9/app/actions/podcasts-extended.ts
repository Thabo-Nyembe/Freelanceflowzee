'use server'

/**
 * Extended Podcasts Server Actions
 * Tables: podcasts, podcast_episodes, podcast_subscriptions, podcast_downloads, podcast_analytics, podcast_categories
 */

import { createClient } from '@/lib/supabase/server'

export async function getPodcast(podcastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcasts').select('*, podcast_episodes(*), podcast_categories(*)').eq('id', podcastId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPodcast(podcastData: { title: string; description: string; author_id: string; cover_image_url?: string; category_id?: string; language?: string; website_url?: string; rss_feed_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcasts').insert({ ...podcastData, status: 'active', subscriber_count: 0, episode_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePodcast(podcastId: string, updates: Partial<{ title: string; description: string; cover_image_url: string; category_id: string; status: string; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcasts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', podcastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePodcast(podcastId: string) {
  try { const supabase = await createClient(); await supabase.from('podcast_episodes').delete().eq('podcast_id', podcastId); await supabase.from('podcast_subscriptions').delete().eq('podcast_id', podcastId); const { error } = await supabase.from('podcasts').delete().eq('id', podcastId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPodcasts(options?: { author_id?: string; category_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('podcasts').select('*, podcast_categories(*)'); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('subscriber_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEpisode(podcastId: string, episodeData: { title: string; description?: string; audio_url: string; duration: number; episode_number?: number; season_number?: number; publish_date?: string; cover_image_url?: string; transcript?: string }) {
  try { const supabase = await createClient(); const { data: podcast } = await supabase.from('podcasts').select('episode_count').eq('id', podcastId).single(); const episodeNumber = episodeData.episode_number ?? ((podcast?.episode_count || 0) + 1); const { data, error } = await supabase.from('podcast_episodes').insert({ podcast_id: podcastId, ...episodeData, episode_number: episodeNumber, status: episodeData.publish_date && new Date(episodeData.publish_date) > new Date() ? 'scheduled' : 'published', download_count: 0, play_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('podcasts').update({ episode_count: (podcast?.episode_count || 0) + 1, last_episode_at: new Date().toISOString() }).eq('id', podcastId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEpisode(episodeId: string, updates: Partial<{ title: string; description: string; audio_url: string; duration: number; status: string; publish_date: string; transcript: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcast_episodes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', episodeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEpisode(episodeId: string) {
  try { const supabase = await createClient(); const { data: episode } = await supabase.from('podcast_episodes').select('podcast_id').eq('id', episodeId).single(); const { error } = await supabase.from('podcast_episodes').delete().eq('id', episodeId); if (error) throw error; if (episode) { const { data: count } = await supabase.from('podcast_episodes').select('id', { count: 'exact' }).eq('podcast_id', episode.podcast_id); await supabase.from('podcasts').update({ episode_count: count?.length || 0 }).eq('id', episode.podcast_id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEpisodes(podcastId: string, options?: { status?: string; season_number?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('podcast_episodes').select('*').eq('podcast_id', podcastId); if (options?.status) query = query.eq('status', options.status); if (options?.season_number) query = query.eq('season_number', options.season_number); const { data, error } = await query.order('episode_number', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function subscribe(podcastId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcast_subscriptions').insert({ podcast_id: podcastId, user_id: userId, subscribed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('podcasts').update({ subscriber_count: supabase.sql`subscriber_count + 1` }).eq('id', podcastId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribe(podcastId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('podcast_subscriptions').delete().eq('podcast_id', podcastId).eq('user_id', userId); if (error) throw error; await supabase.from('podcasts').update({ subscriber_count: supabase.sql`GREATEST(subscriber_count - 1, 0)` }).eq('id', podcastId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordDownload(episodeId: string, userId?: string, metadata?: { ip_address?: string; user_agent?: string }) {
  try { const supabase = await createClient(); await supabase.from('podcast_downloads').insert({ episode_id: episodeId, user_id: userId, ...metadata, downloaded_at: new Date().toISOString() }); await supabase.from('podcast_episodes').update({ download_count: supabase.sql`download_count + 1` }).eq('id', episodeId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordPlay(episodeId: string, userId?: string, playData?: { duration_listened: number; completed: boolean }) {
  try { const supabase = await createClient(); await supabase.from('podcast_analytics').insert({ episode_id: episodeId, user_id: userId, action: 'play', ...playData, recorded_at: new Date().toISOString() }); await supabase.from('podcast_episodes').update({ play_count: supabase.sql`play_count + 1` }).eq('id', episodeId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcast_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubscriptions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('podcast_subscriptions').select('*, podcasts(*)').eq('user_id', userId).order('subscribed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
