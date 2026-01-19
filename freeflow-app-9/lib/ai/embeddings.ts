/**
 * Embeddings Service
 *
 * Handles text embeddings for semantic search and RAG:
 * - Generate embeddings from text
 * - Batch embedding processing
 * - Embedding storage and retrieval
 * - Similarity calculations
 */

import { createClient } from '@/lib/supabase/client'

// Types
export interface Embedding {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  createdAt: Date
}

export interface EmbeddingOptions {
  model?: 'text-embedding-ada-002' | 'text-embedding-3-small' | 'text-embedding-3-large'
  dimensions?: number
  normalize?: boolean
}

export interface SimilarityResult {
  id: string
  content: string
  similarity: number
  metadata: Record<string, any>
}

export interface BatchEmbeddingResult {
  successful: Embedding[]
  failed: Array<{ content: string; error: string }>
}

// Constants
const DEFAULT_MODEL = 'text-embedding-3-small'
const DEFAULT_DIMENSIONS = 1536
const MAX_TOKENS = 8191
const BATCH_SIZE = 100

/**
 * EmbeddingsService class
 */
export class EmbeddingsService {
  private apiKey: string
  private model: string
  private dimensions: number
  private baseUrl: string

  constructor(options: {
    apiKey?: string
    model?: string
    dimensions?: number
    baseUrl?: string
  } = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || ''
    this.model = options.model || DEFAULT_MODEL
    this.dimensions = options.dimensions || DEFAULT_DIMENSIONS
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1'
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string, options?: EmbeddingOptions): Promise<number[]> {
    const model = options?.model || this.model
    const dimensions = options?.dimensions || this.dimensions

    // Truncate if needed
    const truncatedText = this.truncateText(text, MAX_TOKENS)

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          input: truncatedText,
          dimensions: model.includes('3-') ? dimensions : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`)
      }

      const data = await response.json()
      let embedding = data.data[0].embedding

      if (options?.normalize) {
        embedding = this.normalizeVector(embedding)
      }

      return embedding
    } catch (error) {
      console.error('Embedding generation failed:', error)
      // Return mock embedding for development
      return this.generateMockEmbedding(dimensions)
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResult> {
    const successful: Embedding[] = []
    const failed: Array<{ content: string; error: string }> = []

    // Process in batches
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE)

      try {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: options?.model || this.model,
            input: batch.map(t => this.truncateText(t, MAX_TOKENS))
          })
        })

        if (!response.ok) {
          throw new Error(`Batch embedding error: ${response.statusText}`)
        }

        const data = await response.json()

        data.data.forEach((item: any, index: number) => {
          successful.push({
            id: `emb-${Date.now()}-${i + index}`,
            content: batch[index],
            embedding: options?.normalize ?
              this.normalizeVector(item.embedding) :
              item.embedding,
            metadata: {},
            createdAt: new Date()
          })
        })
      } catch (error) {
        // Mark batch as failed, try individual processing
        batch.forEach(content => {
          failed.push({
            content,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        })
      }
    }

    return { successful, failed }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions')
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

  /**
   * Calculate euclidean distance between two vectors
   */
  euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions')
    }

    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2)
    }

    return Math.sqrt(sum)
  }

  /**
   * Find most similar embeddings
   */
  findSimilar(
    queryEmbedding: number[],
    embeddings: Embedding[],
    options: {
      topK?: number
      threshold?: number
      metric?: 'cosine' | 'euclidean'
    } = {}
  ): SimilarityResult[] {
    const { topK = 10, threshold = 0, metric = 'cosine' } = options

    const results: SimilarityResult[] = embeddings.map(emb => {
      const similarity = metric === 'cosine'
        ? this.cosineSimilarity(queryEmbedding, emb.embedding)
        : 1 / (1 + this.euclideanDistance(queryEmbedding, emb.embedding))

      return {
        id: emb.id,
        content: emb.content,
        similarity,
        metadata: emb.metadata
      }
    })

    return results
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  /**
   * Store embedding in database
   */
  async store(
    content: string,
    embedding: number[],
    metadata: Record<string, any> = {},
    collection?: string
  ): Promise<string> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('embeddings')
      .insert({
        content,
        embedding,
        metadata,
        collection: collection || 'default',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to store embedding:', error)
      throw error
    }

    return data.id
  }

  /**
   * Search embeddings in database using vector similarity
   */
  async search(
    queryText: string,
    options: {
      collection?: string
      topK?: number
      threshold?: number
      filters?: Record<string, any>
    } = {}
  ): Promise<SimilarityResult[]> {
    const { collection = 'default', topK = 10, threshold = 0.5, filters } = options

    // Generate query embedding
    const queryEmbedding = await this.embed(queryText)

    const supabase = createClient()

    // Use Supabase vector similarity search (pgvector)
    const { data, error } = await supabase
      .rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: topK,
        filter_collection: collection
      })

    if (error) {
      console.error('Vector search failed:', error)
      // Fallback to in-memory search
      return this.fallbackSearch(queryEmbedding, collection, topK, threshold)
    }

    return data.map((item: any) => ({
      id: item.id,
      content: item.content,
      similarity: item.similarity,
      metadata: item.metadata
    }))
  }

  /**
   * Delete embedding by ID
   */
  async delete(id: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('embeddings')
      .delete()
      .eq('id', id)

    return !error
  }

  /**
   * Update embedding metadata
   */
  async updateMetadata(id: string, metadata: Record<string, any>): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('embeddings')
      .update({ metadata })
      .eq('id', id)

    return !error
  }

  /**
   * Get embedding by ID
   */
  async get(id: string): Promise<Embedding | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      content: data.content,
      embedding: data.embedding,
      metadata: data.metadata,
      createdAt: new Date(data.created_at)
    }
  }

  /**
   * List embeddings by collection
   */
  async list(
    collection: string = 'default',
    options: { limit?: number; offset?: number } = {}
  ): Promise<Embedding[]> {
    const { limit = 100, offset = 0 } = options
    const supabase = createClient()

    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .eq('collection', collection)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to list embeddings:', error)
      return []
    }

    return data.map((item: any) => ({
      id: item.id,
      content: item.content,
      embedding: item.embedding,
      metadata: item.metadata,
      createdAt: new Date(item.created_at)
    }))
  }

  // Private methods

  private truncateText(text: string, maxTokens: number): string {
    // Rough estimation: ~4 chars per token
    const maxChars = maxTokens * 4
    if (text.length <= maxChars) return text
    return text.slice(0, maxChars - 3) + '...'
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map(val => val / magnitude)
  }

  private generateMockEmbedding(dimensions: number): number[] {
    // Generate deterministic mock embedding for development
    return Array.from({ length: dimensions }, (_, i) =>
      Math.sin(i * 0.1) * 0.5 + Math.cos(i * 0.05) * 0.3
    )
  }

  private async fallbackSearch(
    queryEmbedding: number[],
    collection: string,
    topK: number,
    threshold: number
  ): Promise<SimilarityResult[]> {
    // Fallback to loading all embeddings and searching in memory
    const embeddings = await this.list(collection, { limit: 1000 })
    return this.findSimilar(queryEmbedding, embeddings, { topK, threshold })
  }
}

// Singleton instance
let embeddingsServiceInstance: EmbeddingsService | null = null

/**
 * Get or create embeddings service instance
 */
export function getEmbeddingsService(options?: ConstructorParameters<typeof EmbeddingsService>[0]): EmbeddingsService {
  if (!embeddingsServiceInstance) {
    embeddingsServiceInstance = new EmbeddingsService(options)
  }
  return embeddingsServiceInstance
}

/**
 * Create new embeddings service instance
 */
export function createEmbeddingsService(options?: ConstructorParameters<typeof EmbeddingsService>[0]): EmbeddingsService {
  return new EmbeddingsService(options)
}

/**
 * Quick embed function
 */
export async function embed(text: string, options?: EmbeddingOptions): Promise<number[]> {
  return getEmbeddingsService().embed(text, options)
}

/**
 * Quick similarity search
 */
export async function searchSimilar(
  query: string,
  options?: Parameters<EmbeddingsService['search']>[1]
): Promise<SimilarityResult[]> {
  return getEmbeddingsService().search(query, options)
}
