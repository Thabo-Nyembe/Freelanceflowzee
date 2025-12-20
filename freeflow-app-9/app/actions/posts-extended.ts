'use server'

/**
 * Extended Posts Server Actions
 * Tables: posts, post_comments, post_likes, post_shares, post_tags, post_media, post_reactions, post_mentions, post_drafts
 */

import { createClient } from '@/lib/supabase/server'

export async function getPost(postId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('posts').select('*, users(*), post_comments(count), post_likes(count), post_shares(count), post_media(*), post_tags(*)').eq('id', postId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPost(postData: { author_id: string; content: string; title?: string; type?: string; visibility?: string; media?: { url: string; type: string; caption?: string }[]; tags?: string[]; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { media, tags, ...postInfo } = postData; const status = postData.scheduled_at ? 'scheduled' : 'published'; const { data: post, error: postError } = await supabase.from('posts').insert({ ...postInfo, status, published_at: status === 'published' ? new Date().toISOString() : null, like_count: 0, comment_count: 0, share_count: 0, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (postError) throw postError; if (media && media.length > 0) { const mediaData = media.map((m, idx) => ({ post_id: post.id, url: m.url, type: m.type, caption: m.caption, order: idx, created_at: new Date().toISOString() })); await supabase.from('post_media').insert(mediaData) } if (tags && tags.length > 0) { const tagsData = tags.map(tag => ({ post_id: post.id, tag, created_at: new Date().toISOString() })); await supabase.from('post_tags').insert(tagsData) } return { success: true, data: post } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePost(postId: string, updates: Partial<{ content: string; title: string; visibility: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('posts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', postId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePost(postId: string) {
  try { const supabase = await createClient(); await supabase.from('post_comments').delete().eq('post_id', postId); await supabase.from('post_likes').delete().eq('post_id', postId); await supabase.from('post_shares').delete().eq('post_id', postId); await supabase.from('post_media').delete().eq('post_id', postId); await supabase.from('post_tags').delete().eq('post_id', postId); await supabase.from('post_reactions').delete().eq('post_id', postId); await supabase.from('post_mentions').delete().eq('post_id', postId); const { error } = await supabase.from('posts').delete().eq('id', postId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPosts(options?: { author_id?: string; type?: string; visibility?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('posts').select('*, users(*), post_comments(count), post_likes(count), post_media(*)'); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.type) query = query.eq('type', options.type); if (options?.visibility) query = query.eq('visibility', options.visibility); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('content', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function likePost(postId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('post_likes').select('id').eq('post_id', postId).eq('user_id', userId).single(); if (existing) { await supabase.from('post_likes').delete().eq('id', existing.id); await supabase.from('posts').update({ like_count: supabase.sql`like_count - 1` }).eq('id', postId); return { success: true, liked: false } } const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId, created_at: new Date().toISOString() }); if (error) throw error; await supabase.from('posts').update({ like_count: supabase.sql`like_count + 1` }).eq('id', postId); return { success: true, liked: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addComment(postId: string, commentData: { author_id: string; content: string; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('post_comments').insert({ post_id: postId, ...commentData, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await supabase.from('posts').update({ comment_count: supabase.sql`comment_count + 1` }).eq('id', postId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteComment(commentId: string, postId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('post_comments').delete().eq('id', commentId); if (error) throw error; await supabase.from('posts').update({ comment_count: supabase.sql`comment_count - 1` }).eq('id', postId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComments(postId: string, options?: { parent_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('post_comments').select('*, users(*), post_comments(count)').eq('post_id', postId); if (options?.parent_id) { query = query.eq('parent_id', options.parent_id) } else { query = query.is('parent_id', null) } const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sharePost(postId: string, shareData: { user_id: string; platform?: string; message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('post_shares').insert({ post_id: postId, ...shareData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('posts').update({ share_count: supabase.sql`share_count + 1` }).eq('id', postId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addReaction(postId: string, userId: string, reactionType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('post_reactions').select('id, reaction_type').eq('post_id', postId).eq('user_id', userId).single(); if (existing) { if (existing.reaction_type === reactionType) { await supabase.from('post_reactions').delete().eq('id', existing.id); return { success: true, reaction: null } } await supabase.from('post_reactions').update({ reaction_type: reactionType }).eq('id', existing.id); return { success: true, reaction: reactionType } } const { error } = await supabase.from('post_reactions').insert({ post_id: postId, user_id: userId, reaction_type: reactionType, created_at: new Date().toISOString() }); if (error) throw error; return { success: true, reaction: reactionType } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function saveDraft(draftData: { author_id: string; content: string; title?: string; type?: string; media?: any[]; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('post_drafts').insert({ ...draftData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDrafts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('post_drafts').select('*').eq('author_id', userId).order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordView(postId: string, viewerData?: { user_id?: string; ip_address?: string }) {
  try { const supabase = await createClient(); await supabase.from('posts').update({ view_count: supabase.sql`view_count + 1` }).eq('id', postId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
