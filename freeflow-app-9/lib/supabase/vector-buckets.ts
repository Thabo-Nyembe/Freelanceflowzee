/**
 * Supabase Vector Buckets Integration
 *
 * Supabase 2025 Feature: Vector Buckets (Public Alpha)
 * Cold storage for embeddings with integrated query engine
 * Powers AI features like semantic search and personalization
 *
 * @see https://supabase.com/changelog
 */

import { createClient } from '@/lib/supabase/client'
import OpenAI from 'openai'

// Initialize OpenAI for embedding generation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Embedding model configurations
export const EMBEDDING_MODELS = {
  'text-embedding-3-small': { dimensions: 1536, maxTokens: 8191 },
  'text-embedding-3-large': { dimensions: 3072, maxTokens: 8191 },
  'text-embedding-ada-002': { dimensions: 1536, maxTokens: 8191 },
} as const

export type EmbeddingModel = keyof typeof EMBEDDING_MODELS

// Default model for cost efficiency
const DEFAULT_MODEL: EmbeddingModel = 'text-embedding-3-small'

/**
 * Generate embedding vector for text content
 */
export async function generateEmbedding(
  text: string,
  model: EmbeddingModel = DEFAULT_MODEL
): Promise<number[]> {
  // Truncate text if too long
  const maxChars = EMBEDDING_MODELS[model].maxTokens * 4 // Approximate chars per token
  const truncatedText = text.slice(0, maxChars)

  const response = await openai.embeddings.create({
    model,
    input: truncatedText,
  })

  return response.data[0].embedding
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  model: EmbeddingModel = DEFAULT_MODEL
): Promise<number[][]> {
  const maxChars = EMBEDDING_MODELS[model].maxTokens * 4
  const truncatedTexts = texts.map(t => t.slice(0, maxChars))

  const response = await openai.embeddings.create({
    model,
    input: truncatedTexts,
  })

  return response.data.map(d => d.embedding)
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// ============================================
// DOCUMENT EMBEDDING OPERATIONS
// ============================================

export interface DocumentEmbeddingInput {
  userId: string
  sourceType: 'file' | 'document' | 'message' | 'project' | 'task' | 'note'
  sourceId: string
  content: string
  metadata?: Record<string, unknown>
}

/**
 * Create or update document embedding
 */
export async function upsertDocumentEmbedding(input: DocumentEmbeddingInput) {
  const supabase = createClient()

  // Generate content hash for change detection
  const contentHash = await generateContentHash(input.content)

  // Check if embedding already exists with same content
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('id, content_hash')
    .eq('source_type', input.sourceType)
    .eq('source_id', input.sourceId)
    .eq('chunk_index', 0)
    .single()

  if (existing?.content_hash === contentHash) {
    // Content unchanged, skip re-embedding
    return { id: existing.id, skipped: true }
  }

  // Generate embedding
  const embedding = await generateEmbedding(input.content)

  // Upsert embedding
  const { data, error } = await supabase
    .from('document_embeddings')
    .upsert({
      user_id: input.userId,
      source_type: input.sourceType,
      source_id: input.sourceId,
      content_hash: contentHash,
      chunk_index: 0,
      chunk_text: input.content.slice(0, 10000), // Store first 10k chars
      embedding: `[${embedding.join(',')}]`,
      embedding_model: DEFAULT_MODEL,
      metadata: input.metadata || {},
      token_count: Math.ceil(input.content.length / 4),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'source_type,source_id,chunk_index',
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id, skipped: false }
}

/**
 * Create embeddings for long documents (chunked)
 */
export async function createChunkedDocumentEmbeddings(
  input: DocumentEmbeddingInput,
  chunkSize: number = 4000,
  overlap: number = 200
) {
  const supabase = createClient()
  const chunks = chunkText(input.content, chunkSize, overlap)
  const results = []

  // Generate all embeddings in batch
  const embeddings = await generateEmbeddingsBatch(chunks)

  for (let i = 0; i < chunks.length; i++) {
    const contentHash = await generateContentHash(chunks[i])

    const { data, error } = await supabase
      .from('document_embeddings')
      .upsert({
        user_id: input.userId,
        source_type: input.sourceType,
        source_id: input.sourceId,
        content_hash: contentHash,
        chunk_index: i,
        chunk_text: chunks[i],
        embedding: `[${embeddings[i].join(',')}]`,
        embedding_model: DEFAULT_MODEL,
        metadata: { ...input.metadata, total_chunks: chunks.length },
        token_count: Math.ceil(chunks[i].length / 4),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'source_type,source_id,chunk_index',
      })
      .select('id')
      .single()

    if (error) throw error
    results.push(data)
  }

  return results
}

/**
 * Delete document embeddings
 */
export async function deleteDocumentEmbeddings(
  sourceType: string,
  sourceId: string
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('document_embeddings')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)

  if (error) throw error
  return { success: true }
}

// ============================================
// SEMANTIC SEARCH OPERATIONS
// ============================================

export interface SemanticSearchOptions {
  query: string
  userId?: string
  sourceType?: string
  chatId?: string
  threshold?: number
  limit?: number
  logSearch?: boolean
}

/**
 * Semantic search across documents
 */
export async function searchDocuments(options: SemanticSearchOptions) {
  const supabase = createClient()
  const startTime = Date.now()

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(options.query)

  // Call search function
  const { data, error } = await supabase.rpc('search_documents', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: options.threshold || 0.7,
    match_count: options.limit || 10,
    filter_user_id: options.userId || null,
    filter_source_type: options.sourceType || null,
  })

  if (error) throw error

  const duration = Date.now() - startTime

  // Log search if enabled
  if (options.logSearch && options.userId) {
    await logSemanticSearch({
      userId: options.userId,
      queryText: options.query,
      queryEmbedding,
      searchType: 'documents',
      filters: { sourceType: options.sourceType },
      resultCount: data?.length || 0,
      resultIds: data?.map((r: { source_id: string }) => r.source_id) || [],
      durationMs: duration,
    })
  }

  return data || []
}

/**
 * Semantic search across messages
 */
export async function searchMessages(options: SemanticSearchOptions) {
  const supabase = createClient()

  const queryEmbedding = await generateEmbedding(options.query)

  const { data, error } = await supabase.rpc('search_messages', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: options.threshold || 0.7,
    match_count: options.limit || 10,
    filter_user_id: options.userId || null,
    filter_chat_id: options.chatId || null,
  })

  if (error) throw error
  return data || []
}

/**
 * Find similar projects
 */
export async function findSimilarProjects(
  projectId: string,
  userId?: string,
  limit: number = 5
) {
  const supabase = createClient()

  // Get the project's embedding first
  const { data: projectEmbedding } = await supabase
    .from('project_embeddings')
    .select('embedding')
    .eq('project_id', projectId)
    .single()

  if (!projectEmbedding?.embedding) {
    return []
  }

  const { data, error } = await supabase.rpc('find_similar_projects', {
    query_embedding: projectEmbedding.embedding,
    match_count: limit,
    filter_user_id: userId || null,
    exclude_project_id: projectId,
  })

  if (error) throw error
  return data || []
}

/**
 * Global semantic search across all content
 */
export async function globalSemanticSearch(options: SemanticSearchOptions) {
  const supabase = createClient()
  const startTime = Date.now()

  const queryEmbedding = await generateEmbedding(options.query)

  const { data, error } = await supabase.rpc('global_semantic_search', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: options.threshold || 0.7,
    match_count: options.limit || 20,
    filter_user_id: options.userId || null,
  })

  if (error) throw error

  const duration = Date.now() - startTime

  if (options.logSearch && options.userId) {
    await logSemanticSearch({
      userId: options.userId,
      queryText: options.query,
      queryEmbedding,
      searchType: 'global',
      filters: {},
      resultCount: data?.length || 0,
      resultIds: data?.map((r: { content_id: string }) => r.content_id) || [],
      durationMs: duration,
    })
  }

  return data || []
}

// ============================================
// AI CONTENT RECOMMENDATIONS
// ============================================

/**
 * Get AI content recommendations based on user's history
 * Uses pgvector cosine similarity for ranking similar content
 */
export async function getAIContentRecommendations(
  userId: string,
  contentType?: string,
  limit: number = 10
) {
  const supabase = createClient()

  // Get user's recent AI content embeddings
  const { data: userContent } = await supabase
    .from('ai_content_embeddings')
    .select('embedding, style_tags')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!userContent?.length) {
    return []
  }

  // Average the embeddings to create user preference vector
  const userEmbeddings = userContent
    .filter(c => c.embedding)
    .map(c => {
      // Handle both string and array formats for embedding
      if (typeof c.embedding === 'string') {
        return JSON.parse(c.embedding)
      }
      return c.embedding
    })

  if (userEmbeddings.length === 0) {
    return []
  }

  const avgEmbedding = averageEmbeddings(userEmbeddings)

  // Use pgvector similarity search via RPC to find similar content
  // This uses cosine similarity (1 - cosine distance) for ranking
  const { data, error } = await supabase.rpc('vector_find_similar_ai_content', {
    query_embedding: `[${avgEmbedding.join(',')}]`,
    match_threshold: 0.5, // Lower threshold to include more diverse recommendations
    match_count: limit,
    filter_content_type: contentType || null,
    exclude_user_id: userId, // Exclude user's own content for discovery
  })

  if (error) {
    // Fallback to basic query if RPC function doesn't exist yet
    console.warn('Vector similarity RPC not available, using fallback:', error.message)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('ai_content_embeddings')
      .select('content_id, content_type, style_tags')
      .neq('user_id', userId)
      .limit(limit)

    if (fallbackError) throw fallbackError
    return fallbackData || []
  }

  // Return results sorted by similarity score (already sorted by RPC)
  return (data || []).map((item: {
    content_id: string
    content_type: string
    style_tags: string[]
    similarity: number
    user_id: string
  }) => ({
    content_id: item.content_id,
    content_type: item.content_type,
    style_tags: item.style_tags,
    similarity: item.similarity,
  }))
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate SHA256 hash of content
 */
async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - overlap

    if (start >= text.length - overlap) break
  }

  return chunks
}

/**
 * Average multiple embedding vectors
 */
function averageEmbeddings(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return []

  const dimensions = embeddings[0].length
  const avg = new Array(dimensions).fill(0)

  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      avg[i] += embedding[i]
    }
  }

  return avg.map(v => v / embeddings.length)
}

/**
 * Log semantic search for analytics
 */
async function logSemanticSearch(params: {
  userId: string
  queryText: string
  queryEmbedding: number[]
  searchType: string
  filters: Record<string, unknown>
  resultCount: number
  resultIds: string[]
  durationMs: number
}) {
  const supabase = createClient()

  await supabase.from('semantic_search_log').insert({
    user_id: params.userId,
    query_text: params.queryText,
    query_embedding: `[${params.queryEmbedding.join(',')}]`,
    search_type: params.searchType,
    filters: params.filters,
    limit_count: params.resultIds.length,
    result_count: params.resultCount,
    result_ids: params.resultIds,
    search_duration_ms: params.durationMs,
  })
}

// ============================================
// EXPORT TYPES
// ============================================

export interface SearchResult {
  id: string
  source_type?: string
  source_id?: string
  content_type?: string
  content_id?: string
  preview?: string
  chunk_text?: string
  similarity: number
  metadata?: Record<string, unknown>
}

export interface DocumentEmbedding {
  id: string
  user_id: string
  source_type: string
  source_id: string
  content_hash: string
  chunk_index: number
  chunk_text: string
  embedding_model: string
  metadata: Record<string, unknown>
  token_count: number
  created_at: string
  updated_at: string
}
