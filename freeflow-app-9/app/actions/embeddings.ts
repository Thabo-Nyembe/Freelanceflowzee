'use server'

/**
 * Server Actions for Vector Embeddings
 *
 * Supabase 2025 Feature: Vector Buckets with pgvector
 */

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('embeddings-actions')

// ============================================
// TYPES
// ============================================

export interface EmbeddingInput {
  userId: string
  sourceType: 'file' | 'document' | 'message' | 'project' | 'task' | 'note'
  sourceId: string
  content: string
  metadata?: Record<string, unknown>
}

export interface SearchInput {
  query: string
  userId?: string
  threshold?: number
  limit?: number
  sourceType?: string
}

// ============================================
// DOCUMENT EMBEDDINGS
// ============================================

export async function createDocumentEmbedding(input: Omit<EmbeddingInput, 'userId'>): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating document embedding', { sourceType: input.sourceType, sourceId: input.sourceId })

    // Generate content hash
    const encoder = new TextEncoder()
    const data = encoder.encode(input.content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: result, error } = await supabase
      .from('document_embeddings')
      .insert({
        user_id: user.id,
        source_type: input.sourceType,
        source_id: input.sourceId,
        content_hash: contentHash,
        chunk_text: input.content.substring(0, 10000),
        metadata: input.metadata || {},
        token_count: Math.ceil(input.content.length / 4),
      })
      .select()
      .single()

    if (error) throw error

    return actionSuccess(result)
  } catch (error) {
    logger.error('createDocumentEmbedding failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to create embedding')
  }
}

export async function deleteDocumentEmbedding(id: string): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('document_embeddings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return actionSuccess(null)
  } catch (error) {
    logger.error('deleteDocumentEmbedding failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to delete embedding')
  }
}

export async function deleteEmbeddingsBySource(sourceType: string, sourceId: string): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('document_embeddings')
      .delete()
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .eq('user_id', user.id)

    if (error) throw error

    return actionSuccess(null)
  } catch (error) {
    logger.error('deleteEmbeddingsBySource failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to delete embeddings')
  }
}

export async function getDocumentEmbeddings(limit = 50): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('document_embeddings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getDocumentEmbeddings failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get embeddings')
  }
}

// ============================================
// MESSAGE EMBEDDINGS
// ============================================

export async function createMessageEmbedding(
  messageId: string,
  chatId: string | null,
  contentPreview: string
): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: result, error } = await supabase
      .from('message_embeddings')
      .insert({
        user_id: user.id,
        message_id: messageId,
        chat_id: chatId,
        content_preview: contentPreview.substring(0, 500),
      })
      .select()
      .single()

    if (error) throw error

    return actionSuccess(result)
  } catch (error) {
    logger.error('createMessageEmbedding failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to create embedding')
  }
}

export async function getMessageEmbeddingsByChat(chatId: string): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('message_embeddings')
      .select('*')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getMessageEmbeddingsByChat failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get embeddings')
  }
}

// ============================================
// PROJECT EMBEDDINGS
// ============================================

export async function createProjectEmbedding(
  projectId: string,
  projectType?: string,
  tags?: string[]
): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: result, error } = await supabase
      .from('project_embeddings')
      .upsert({
        user_id: user.id,
        project_id: projectId,
        project_type: projectType,
        tags: tags || [],
      }, {
        onConflict: 'project_id',
      })
      .select()
      .single()

    if (error) throw error

    return actionSuccess(result)
  } catch (error) {
    logger.error('createProjectEmbedding failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to create embedding')
  }
}

export async function getProjectEmbedding(projectId: string): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('project_embeddings')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return actionSuccess(data)
  } catch (error) {
    logger.error('getProjectEmbedding failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get embedding')
  }
}

// ============================================
// AI CONTENT EMBEDDINGS
// ============================================

export async function createAIContentEmbedding(
  contentType: 'ai_design' | 'ai_text' | 'ai_code' | 'ai_image' | 'ai_video',
  contentId: string,
  styleTags?: string[]
): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: result, error } = await supabase
      .from('ai_content_embeddings')
      .upsert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        style_tags: styleTags || [],
      }, {
        onConflict: 'content_type,content_id',
      })
      .select()
      .single()

    if (error) throw error

    return actionSuccess(result)
  } catch (error) {
    logger.error('createAIContentEmbedding failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to create embedding')
  }
}

export async function getAIContentEmbeddingsByType(contentType: string): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('ai_content_embeddings')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getAIContentEmbeddingsByType failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get embeddings')
  }
}

// ============================================
// SEMANTIC SEARCH LOG
// ============================================

export async function logSemanticSearch(
  queryText: string,
  searchType: string,
  resultCount: number,
  resultIds: string[],
  durationMs: number,
  filters?: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    // Allow logging for non-authenticated users too (public search)

    const { error } = await supabase
      .from('semantic_search_log')
      .insert({
        user_id: user?.id || null,
        query_text: queryText,
        search_type: searchType,
        filters: filters || {},
        result_count: resultCount,
        result_ids: resultIds,
        search_duration_ms: durationMs,
      })

    if (error) throw error

    return actionSuccess(null)
  } catch (error) {
    logger.error('logSemanticSearch failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to log search')
  }
}

export async function getSearchHistory(limit = 20): Promise<ActionResult> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('semantic_search_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getSearchHistory failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get history')
  }
}
