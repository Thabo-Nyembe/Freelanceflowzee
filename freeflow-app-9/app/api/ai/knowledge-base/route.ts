/**
 * Knowledge Base API
 *
 * RAG-powered knowledge base management:
 * - Document upload and indexing
 * - Query with context retrieval
 * - Source citations
 * - Knowledge graph
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEmbeddingsService } from '@/lib/ai/embeddings'
import { getVectorSearchService } from '@/lib/ai/vector-search'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-knowledge-base')

// Types
interface KnowledgeDocument {
  id: string
  title: string
  content: string
  type: 'article' | 'faq' | 'guide' | 'policy' | 'code' | 'custom'
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  embedding?: number[]
  createdAt: string
  updatedAt: string
}

interface KnowledgeQuery {
  question: string
  filters?: {
    types?: string[]
    categories?: string[]
    tags?: string[]
  }
  topK?: number
  threshold?: number
  includeContext?: boolean
}

interface KnowledgeResult {
  answer: string
  sources: Array<{
    id: string
    title: string
    content: string
    relevance: number
    type: string
  }>
  confidence: number
  context?: string
}

// POST - Handle knowledge base operations
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'query':
        return await handleQuery(body, user.id)
      case 'add':
        return await handleAddDocument(body, user.id)
      case 'update':
        return await handleUpdateDocument(body, user.id)
      case 'delete':
        return await handleDeleteDocument(body, user.id)
      case 'bulk-add':
        return await handleBulkAdd(body, user.id)
      case 'reindex':
        return await handleReindex(body, user.id)
      case 'get-similar':
        return await handleGetSimilar(body, user.id)
      case 'get-graph':
        return await handleGetGraph(body, user.id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Knowledge base API error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Retrieve knowledge base documents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('knowledge_documents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (type) {
      query = query.eq('type', type)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      documents: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    logger.error('Get knowledge base error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Query knowledge base with RAG
async function handleQuery(body: any, userId: string): Promise<NextResponse> {
  const { question, filters, topK = 5, threshold = 0.5, includeContext = true } = body as KnowledgeQuery

  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const vectorSearch = getVectorSearchService()

  // Build search options
  const searchOptions: any = {
    topK,
    threshold,
    hybrid: true,
    rerank: true,
    collections: [`knowledge-${userId}`]
  }

  // Perform semantic search
  const searchResponse = await vectorSearch.semanticSearch(question, undefined, searchOptions)

  if (searchResponse.results.length === 0) {
    return NextResponse.json({
      answer: "I couldn't find relevant information in the knowledge base to answer your question.",
      sources: [],
      confidence: 0
    })
  }

  // Build context from results
  const context = searchResponse.results
    .map(r => `[Source: ${r.metadata?.title || 'Untitled'}]\n${r.content}`)
    .join('\n\n---\n\n')

  // Generate answer using AI
  const answer = await generateAnswer(question, context, searchResponse.results)

  const result: KnowledgeResult = {
    answer: answer.text,
    sources: searchResponse.results.map(r => ({
      id: r.id,
      title: r.metadata?.title || 'Untitled',
      content: r.content.substring(0, 200) + '...',
      relevance: r.score,
      type: r.metadata?.type || 'document'
    })),
    confidence: answer.confidence,
    context: includeContext ? context : undefined
  }

  return NextResponse.json(result)
}

// Add document to knowledge base
async function handleAddDocument(body: any, userId: string): Promise<NextResponse> {
  const { title, content, type = 'article', category, tags, metadata } = body

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const embeddingsService = getEmbeddingsService()

  // Generate embedding
  const embedding = await embeddingsService.embed(
    `${title}\n\n${content}`,
    { normalize: true }
  )

  // Store in database
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert({
      user_id: userId,
      title,
      content,
      type,
      category,
      tags: tags || [],
      metadata: metadata || {},
      embedding,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  // Store in vector index
  await embeddingsService.store(
    content,
    embedding,
    { title, type, category, tags, documentId: data.id },
    `knowledge-${userId}`
  )

  return NextResponse.json({
    success: true,
    document: data
  })
}

// Update document
async function handleUpdateDocument(body: any, userId: string): Promise<NextResponse> {
  const { id, title, content, type, category, tags, metadata } = body

  if (!id) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const embeddingsService = getEmbeddingsService()

  // Build update object
  const updates: any = { updated_at: new Date().toISOString() }
  if (title !== undefined) updates.title = title
  if (content !== undefined) updates.content = content
  if (type !== undefined) updates.type = type
  if (category !== undefined) updates.category = category
  if (tags !== undefined) updates.tags = tags
  if (metadata !== undefined) updates.metadata = metadata

  // Re-generate embedding if content changed
  if (content !== undefined || title !== undefined) {
    const { data: existing } = await supabase
      .from('knowledge_documents')
      .select('title, content')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (existing) {
      const newTitle = title || existing.title
      const newContent = content || existing.content
      updates.embedding = await embeddingsService.embed(
        `${newTitle}\n\n${newContent}`,
        { normalize: true }
      )
    }
  }

  const { data, error } = await supabase
    .from('knowledge_documents')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  return NextResponse.json({
    success: true,
    document: data
  })
}

// Delete document
async function handleDeleteDocument(body: any, userId: string): Promise<NextResponse> {
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const embeddingsService = getEmbeddingsService()

  // Delete from database
  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error

  // Delete from vector index
  await embeddingsService.delete(id)

  return NextResponse.json({ success: true })
}

// Bulk add documents
async function handleBulkAdd(body: any, userId: string): Promise<NextResponse> {
  const { documents } = body

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json(
      { error: 'Documents array is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const embeddingsService = getEmbeddingsService()

  const results = {
    successful: [] as unknown[],
    failed: [] as Array<{ document: any; error: string }>
  }

  // Process in batches
  const batchSize = 10
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize)

    // Generate embeddings for batch
    const embeddings = await embeddingsService.embedBatch(
      batch.map(d => `${d.title}\n\n${d.content}`)
    )

    for (let j = 0; j < batch.length; j++) {
      const doc = batch[j]
      const embedding = embeddings.successful[j]?.embedding

      if (!embedding) {
        results.failed.push({
          document: doc,
          error: 'Failed to generate embedding'
        })
        continue
      }

      try {
        const { data, error } = await supabase
          .from('knowledge_documents')
          .insert({
            user_id: userId,
            title: doc.title,
            content: doc.content,
            type: doc.type || 'article',
            category: doc.category,
            tags: doc.tags || [],
            metadata: doc.metadata || {},
            embedding,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Store in vector index
        await embeddingsService.store(
          doc.content,
          embedding,
          { title: doc.title, type: doc.type, documentId: data.id },
          `knowledge-${userId}`
        )

        results.successful.push(data)
      } catch (error) {
        results.failed.push({
          document: doc,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  return NextResponse.json({
    success: true,
    added: results.successful.length,
    failed: results.failed.length,
    results
  })
}

// Reindex all documents
async function handleReindex(body: any, userId: string): Promise<NextResponse> {
  const supabase = await createClient()
  const embeddingsService = getEmbeddingsService()

  // Get all documents
  const { data: documents, error } = await supabase
    .from('knowledge_documents')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  let reindexed = 0
  let failed = 0

  for (const doc of documents || []) {
    try {
      // Regenerate embedding
      const embedding = await embeddingsService.embed(
        `${doc.title}\n\n${doc.content}`,
        { normalize: true }
      )

      // Update document
      await supabase
        .from('knowledge_documents')
        .update({ embedding, updated_at: new Date().toISOString() })
        .eq('id', doc.id)

      // Update vector index
      await embeddingsService.store(
        doc.content,
        embedding,
        { title: doc.title, type: doc.type, documentId: doc.id },
        `knowledge-${userId}`
      )

      reindexed++
    } catch (error) {
      logger.error('Failed to reindex document', { documentId: doc.id, error })
      failed++
    }
  }

  return NextResponse.json({
    success: true,
    reindexed,
    failed,
    total: documents?.length || 0
  })
}

// Get similar documents
async function handleGetSimilar(body: any, userId: string): Promise<NextResponse> {
  const { documentId, topK = 5 } = body

  if (!documentId) {
    return NextResponse.json(
      { error: 'Document ID is required' },
      { status: 400 }
    )
  }

  const vectorSearch = getVectorSearchService()

  const similar = await vectorSearch.findSimilar(
    documentId,
    `knowledge-${userId}`,
    { topK }
  )

  return NextResponse.json({
    success: true,
    similar: similar.map(s => ({
      id: s.id,
      title: s.metadata?.title,
      content: s.content.substring(0, 200) + '...',
      similarity: s.similarity,
      type: s.metadata?.type
    }))
  })
}

// Get knowledge graph
async function handleGetGraph(body: any, userId: string): Promise<NextResponse> {
  const supabase = await createClient()
  const vectorSearch = getVectorSearchService()

  // Get all documents
  const { data: documents, error } = await supabase
    .from('knowledge_documents')
    .select('id, title, type, category, tags')
    .eq('user_id', userId)

  if (error) throw error

  // Build graph nodes
  const nodes = (documents || []).map(doc => ({
    id: doc.id,
    label: doc.title,
    type: doc.type,
    category: doc.category,
    tags: doc.tags || []
  }))

  // Build edges based on similarity and shared attributes
  const edges: Array<{ source: string; target: string; weight: number; type: string }> = []

  // Add edges for documents in same category
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      // Same category
      if (nodes[i].category && nodes[i].category === nodes[j].category) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          weight: 0.5,
          type: 'category'
        })
      }

      // Shared tags
      const sharedTags = nodes[i].tags.filter((t: string) => nodes[j].tags.includes(t))
      if (sharedTags.length > 0) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          weight: Math.min(1, sharedTags.length * 0.3),
          type: 'tags'
        })
      }
    }
  }

  return NextResponse.json({
    success: true,
    graph: {
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length
    }
  })
}

// Generate answer from context using AI
async function generateAnswer(
  question: string,
  context: string,
  sources: any[]
): Promise<{ text: string; confidence: number }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that answers questions based on the provided context.
            Only use information from the context to answer. If the context doesn't contain enough information, say so.
            Cite your sources by mentioning the source titles when relevant.
            Be concise but thorough.`
          },
          {
            role: 'user',
            content: `Context:\n${context}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('AI API error')
    }

    const data = await response.json()
    const answer = data.choices[0].message.content

    // Calculate confidence based on source relevance
    const avgRelevance = sources.reduce((sum, s) => sum + s.score, 0) / sources.length
    const confidence = Math.min(avgRelevance * 1.2, 1) // Scale and cap at 1

    return { text: answer, confidence }
  } catch (error) {
    logger.error('Answer generation error', { error })

    // Fallback to extractive summary
    const relevantText = sources
      .slice(0, 3)
      .map(s => s.content)
      .join(' ')

    return {
      text: `Based on the knowledge base: ${relevantText.substring(0, 500)}...`,
      confidence: 0.5
    }
  }
}
