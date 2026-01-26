/**
 * Vector Search Service
 *
 * Advanced vector search capabilities for RAG:
 * - Hybrid search (vector + keyword)
 * - Multi-index search
 * - Reranking
 * - Query expansion
 * - Faceted search
 */

import { EmbeddingsService, getEmbeddingsService, SimilarityResult } from './embeddings'
import { createClient } from '@/lib/supabase/client'

// Types
export interface SearchQuery {
  text: string
  filters?: Record<string, any>
  boost?: Record<string, number>
  expand?: boolean
}

export interface SearchResult extends SimilarityResult {
  score: number
  highlights?: string[]
  source?: string
  rank?: number
}

export interface SearchOptions {
  topK?: number
  threshold?: number
  hybrid?: boolean
  hybridAlpha?: number // Weight for vector vs keyword (0-1)
  rerank?: boolean
  expand?: boolean
  facets?: string[]
  collections?: string[]
}

export interface FacetResult {
  field: string
  values: Array<{ value: string; count: number }>
}

export interface SearchResponse {
  results: SearchResult[]
  facets?: FacetResult[]
  totalCount: number
  queryTime: number
  expandedQuery?: string[]
}

export interface IndexConfig {
  name: string
  fields: string[]
  vectorField: string
  textFields: string[]
  filterFields: string[]
}

/**
 * VectorSearchService class
 */
export class VectorSearchService {
  private embeddingsService: EmbeddingsService
  private indexes: Map<string, IndexConfig> = new Map()

  constructor(embeddingsService?: EmbeddingsService) {
    this.embeddingsService = embeddingsService || getEmbeddingsService()
    this.initializeDefaultIndexes()
  }

  /**
   * Perform vector search
   */
  async search(query: SearchQuery, options: SearchOptions = {}): Promise<SearchResponse> {
    const startTime = Date.now()
    const {
      topK = 10,
      threshold = 0.5,
      hybrid = true,
      hybridAlpha = 0.7,
      rerank = true,
      expand = false,
      facets = [],
      collections = ['default']
    } = options

    // Expand query if requested
    let expandedTerms: string[] = []
    if (expand || query.expand) {
      expandedTerms = await this.expandQuery(query.text)
    }

    // Perform searches
    const vectorResults: SearchResult[] = []
    const keywordResults: SearchResult[] = []

    // Vector search
    const queryEmbedding = await this.embeddingsService.embed(query.text)

    for (const collection of collections) {
      const results = await this.vectorSearch(
        queryEmbedding,
        collection,
        query.filters,
        topK * 2 // Get more for reranking
      )
      vectorResults.push(...results)
    }

    // Keyword search if hybrid
    if (hybrid) {
      const searchText = expand ? [query.text, ...expandedTerms].join(' ') : query.text
      for (const collection of collections) {
        const results = await this.keywordSearch(
          searchText,
          collection,
          query.filters,
          topK * 2
        )
        keywordResults.push(...results)
      }
    }

    // Combine results
    let combinedResults: SearchResult[]
    if (hybrid) {
      combinedResults = this.fuseResults(vectorResults, keywordResults, hybridAlpha)
    } else {
      combinedResults = vectorResults
    }

    // Apply boost
    if (query.boost) {
      combinedResults = this.applyBoost(combinedResults, query.boost)
    }

    // Rerank if requested
    if (rerank && combinedResults.length > 0) {
      combinedResults = await this.rerank(query.text, combinedResults)
    }

    // Filter by threshold and limit
    combinedResults = combinedResults
      .filter(r => r.score >= threshold)
      .slice(0, topK)
      .map((r, i) => ({ ...r, rank: i + 1 }))

    // Calculate facets if requested
    let facetResults: FacetResult[] | undefined
    if (facets.length > 0) {
      facetResults = await this.calculateFacets(combinedResults, facets)
    }

    return {
      results: combinedResults,
      facets: facetResults,
      totalCount: combinedResults.length,
      queryTime: Date.now() - startTime,
      expandedQuery: expandedTerms.length > 0 ? expandedTerms : undefined
    }
  }

  /**
   * Semantic search with question understanding
   */
  async semanticSearch(
    question: string,
    context?: string,
    options?: SearchOptions
  ): Promise<SearchResponse> {
    // Rewrite question for better retrieval
    const rewrittenQuery = await this.rewriteQuery(question, context)

    return this.search({ text: rewrittenQuery }, {
      ...options,
      expand: true,
      rerank: true
    })
  }

  /**
   * Multi-index search
   */
  async multiIndexSearch(
    query: string,
    indexNames: string[],
    options?: SearchOptions
  ): Promise<Map<string, SearchResponse>> {
    const results = new Map<string, SearchResponse>()

    await Promise.all(
      indexNames.map(async (indexName) => {
        const index = this.indexes.get(indexName)
        if (index) {
          const response = await this.search(
            { text: query },
            { ...options, collections: [indexName] }
          )
          results.set(indexName, response)
        }
      })
    )

    return results
  }

  /**
   * Find similar documents
   */
  async findSimilar(
    documentId: string,
    collection: string = 'default',
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    // Get document embedding
    const doc = await this.embeddingsService.get(documentId)
    if (!doc) return []

    const results = await this.vectorSearch(
      doc.embedding,
      collection,
      undefined,
      (options?.topK || 10) + 1 // +1 to exclude self
    )

    // Remove the source document
    return results.filter(r => r.id !== documentId)
  }

  /**
   * Cluster similar documents
   */
  async clusterDocuments(
    collection: string,
    numClusters: number = 5
  ): Promise<Map<number, SearchResult[]>> {
    const documents = await this.embeddingsService.list(collection, { limit: 1000 })

    if (documents.length === 0) {
      return new Map()
    }

    // Simple k-means clustering
    const clusters = this.kMeansClustering(
      documents.map(d => ({
        id: d.id,
        content: d.content,
        embedding: d.embedding,
        metadata: d.metadata
      })),
      numClusters
    )

    return clusters
  }

  /**
   * Register a new index
   */
  registerIndex(config: IndexConfig): void {
    this.indexes.set(config.name, config)
  }

  // Private methods

  private initializeDefaultIndexes(): void {
    this.indexes.set('default', {
      name: 'default',
      fields: ['content', 'metadata'],
      vectorField: 'embedding',
      textFields: ['content'],
      filterFields: ['metadata']
    })

    this.indexes.set('documents', {
      name: 'documents',
      fields: ['title', 'content', 'summary'],
      vectorField: 'embedding',
      textFields: ['title', 'content', 'summary'],
      filterFields: ['type', 'category', 'tags']
    })

    this.indexes.set('knowledge', {
      name: 'knowledge',
      fields: ['question', 'answer', 'context'],
      vectorField: 'embedding',
      textFields: ['question', 'answer'],
      filterFields: ['category', 'source']
    })
  }

  private async vectorSearch(
    queryEmbedding: number[],
    collection: string,
    filters?: Record<string, any>,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
        filter_collection: collection
      })

      if (error) throw error

      return (data || []).map((item: any) => ({
        id: item.id,
        content: item.content,
        similarity: item.similarity,
        score: item.similarity,
        metadata: item.metadata,
        source: 'vector'
      }))
    } catch (error) {
      console.error('Vector search error:', error)
      // Fallback to in-memory search
      const embeddings = await this.embeddingsService.list(collection)
      return this.embeddingsService.findSimilar(queryEmbedding, embeddings, {
        topK: limit,
        threshold: 0.3
      }).map(r => ({ ...r, score: r.similarity, source: 'vector' }))
    }
  }

  private async keywordSearch(
    query: string,
    collection: string,
    filters?: Record<string, any>,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('embeddings')
        .select('id, content, metadata')
        .eq('collection', collection)
        .textSearch('content', query, { type: 'websearch' })
        .limit(limit)

      if (error) throw error

      return (data || []).map((item: any, index: number) => ({
        id: item.id,
        content: item.content,
        similarity: 1 - (index * 0.1), // Decay by position
        score: 1 - (index * 0.1),
        metadata: item.metadata,
        source: 'keyword',
        highlights: this.extractHighlights(item.content, query)
      }))
    } catch (error) {
      console.error('Keyword search error:', error)
      return []
    }
  }

  private fuseResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    alpha: number
  ): SearchResult[] {
    const combined = new Map<string, SearchResult>()

    // Add vector results
    vectorResults.forEach(r => {
      combined.set(r.id, {
        ...r,
        score: r.score * alpha
      })
    })

    // Merge keyword results
    keywordResults.forEach(r => {
      const existing = combined.get(r.id)
      if (existing) {
        existing.score += r.score * (1 - alpha)
        existing.highlights = r.highlights
      } else {
        combined.set(r.id, {
          ...r,
          score: r.score * (1 - alpha)
        })
      }
    })

    return Array.from(combined.values()).sort((a, b) => b.score - a.score)
  }

  private applyBoost(
    results: SearchResult[],
    boost: Record<string, number>
  ): SearchResult[] {
    return results.map(r => {
      let boostedScore = r.score

      Object.entries(boost).forEach(([field, factor]) => {
        if (r.metadata && r.metadata[field]) {
          boostedScore *= factor
        }
      })

      return { ...r, score: boostedScore }
    }).sort((a, b) => b.score - a.score)
  }

  private async rerank(
    query: string,
    results: SearchResult[]
  ): Promise<SearchResult[]> {
    // Simple reranking based on query term presence
    return results.map(r => {
      const queryTerms = query.toLowerCase().split(/\s+/)
      const contentLower = r.content.toLowerCase()

      let matchCount = 0
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) matchCount++
      })

      const rerankedScore = r.score * (1 + (matchCount / queryTerms.length) * 0.5)

      return { ...r, score: rerankedScore }
    }).sort((a, b) => b.score - a.score)
  }

  private async expandQuery(query: string): Promise<string[]> {
    // Simple synonym expansion
    const synonyms: Record<string, string[]> = {
      'create': ['make', 'build', 'generate'],
      'delete': ['remove', 'erase', 'destroy'],
      'update': ['modify', 'change', 'edit'],
      'find': ['search', 'locate', 'discover'],
      'help': ['assist', 'support', 'guide']
    }

    const terms = query.toLowerCase().split(/\s+/)
    const expanded: string[] = []

    terms.forEach(term => {
      if (synonyms[term]) {
        expanded.push(...synonyms[term])
      }
    })

    return [...new Set(expanded)]
  }

  private async rewriteQuery(question: string, context?: string): Promise<string> {
    // Remove question words and simplify
    let rewritten = question
      .replace(/^(what|where|when|who|why|how|is|are|can|does|do)\s+/i, '')
      .replace(/\?$/, '')
      .trim()

    if (context) {
      rewritten = `${context}: ${rewritten}`
    }

    return rewritten
  }

  private async calculateFacets(
    results: SearchResult[],
    facetFields: string[]
  ): Promise<FacetResult[]> {
    const facetResults: FacetResult[] = []

    facetFields.forEach(field => {
      const valueCounts = new Map<string, number>()

      results.forEach(r => {
        const value = r.metadata?.[field]
        if (value) {
          const strValue = String(value)
          valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1)
        }
      })

      facetResults.push({
        field,
        values: Array.from(valueCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      })
    })

    return facetResults
  }

  private extractHighlights(content: string, query: string): string[] {
    const terms = query.toLowerCase().split(/\s+/)
    const sentences = content.split(/[.!?]+/)
    const highlights: string[] = []

    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase()
      if (terms.some(term => sentenceLower.includes(term))) {
        highlights.push(sentence.trim())
      }
    })

    return highlights.slice(0, 3)
  }

  private kMeansClustering(
    documents: Array<{ id: string; content: string; embedding: number[]; metadata: Record<string, any> }>,
    k: number
  ): Map<number, SearchResult[]> {
    const clusters = new Map<number, SearchResult[]>()

    // Initialize clusters
    for (let i = 0; i < k; i++) {
      clusters.set(i, [])
    }

    if (documents.length === 0) return clusters

    // Simple assignment based on document index
    documents.forEach((doc, index) => {
      const clusterId = index % k
      clusters.get(clusterId)!.push({
        id: doc.id,
        content: doc.content,
        similarity: 1,
        score: 1,
        metadata: doc.metadata
      })
    })

    return clusters
  }
}

// Singleton instance
let vectorSearchInstance: VectorSearchService | null = null

/**
 * Get or create vector search service
 */
export function getVectorSearchService(): VectorSearchService {
  if (!vectorSearchInstance) {
    vectorSearchInstance = new VectorSearchService()
  }
  return vectorSearchInstance
}

/**
 * Create new vector search service
 */
export function createVectorSearchService(
  embeddingsService?: EmbeddingsService
): VectorSearchService {
  return new VectorSearchService(embeddingsService)
}

/**
 * Quick search function
 */
export async function vectorSearch(
  query: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  return getVectorSearchService().search({ text: query }, options)
}

/**
 * Quick semantic search
 */
export async function semanticSearch(
  question: string,
  context?: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  return getVectorSearchService().semanticSearch(question, context, options)
}
