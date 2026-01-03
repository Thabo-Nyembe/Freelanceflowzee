'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('ai-create')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface GenerationFilters {
  generationType?: string
  status?: string
  template?: string
}

interface GenerationData {
  title?: string
  generation_type?: string
  template?: string
  prompt: string
  model?: string
  temperature?: number
  max_tokens?: number
  tags?: string[]
}

interface GenerationUpdates {
  title?: string
  result?: string
  status?: string
  quality_score?: number
  readability_score?: number
  seo_score?: number
  tags?: string[]
  error_message?: string
  keywords?: string[]
}

interface TokenStats {
  promptTokens: number
  completionTokens: number
  latencyMs: number
  cost: number
}

interface ContentScores {
  qualityScore?: number
  readabilityScore?: number
  seoScore?: number
}

interface GenerationStats {
  total: number
  completed: number
  pending: number
  failed: number
  totalTokens: number
  totalCost: number
  byType: Record<string, number>
  avgQualityScore: number
  avgLatency: number
}

interface ContentAnalysis {
  wordCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  readabilityScore: number
  seoScore: number
  qualityScore: number
}

interface Template {
  id: string
  name: string
  type: string
  description: string
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function getGenerations(
  options?: GenerationFilters
): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getGenerations')
      return actionError('Not authenticated')
    }

    let query = supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (options?.generationType) {
      query = query.eq('generation_type', options.generationType)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.template) {
      query = query.eq('template', options.template)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to fetch generations', { error, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Generations fetched successfully', { userId: user.id, count: data?.length })
    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error in getGenerations', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function getGeneration(generationId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(generationId)
    if (!validationResult.success) {
      return actionError('Invalid generation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getGeneration', { generationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch generation', { error, generationId, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Generation fetched successfully', { generationId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in getGeneration', { error, generationId })
    return actionError('An unexpected error occurred')
  }
}

export async function createGeneration(
  generationData: GenerationData
): Promise<ActionResult<unknown>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to createGeneration')
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        title: generationData.title || `${generationData.generation_type || 'content'} Generation`,
        generation_type: generationData.generation_type || 'content',
        template: generationData.template,
        prompt: generationData.prompt,
        model: generationData.model || 'gpt-4',
        temperature: generationData.temperature || 0.7,
        max_tokens: generationData.max_tokens || 2000,
        tags: generationData.tags || [],
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create generation', { error, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-create-v2')
    logger.info('Generation created successfully', { generationId: data.id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in createGeneration', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function updateGeneration(
  generationId: string,
  updates: GenerationUpdates
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(generationId)
    if (!validationResult.success) {
      return actionError('Invalid generation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to updateGeneration', { generationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update generation', { error, generationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-create-v2')
    logger.info('Generation updated successfully', { generationId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in updateGeneration', { error, generationId })
    return actionError('An unexpected error occurred')
  }
}

export async function completeGeneration(
  generationId: string,
  result: string,
  tokenStats: TokenStats,
  scores?: ContentScores,
  keywords?: string[]
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(generationId)
    if (!validationResult.success) {
      return actionError('Invalid generation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to completeGeneration', { generationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .update({
        result,
        status: 'completed',
        prompt_tokens: tokenStats.promptTokens,
        completion_tokens: tokenStats.completionTokens,
        total_tokens: tokenStats.promptTokens + tokenStats.completionTokens,
        latency_ms: tokenStats.latencyMs,
        cost: tokenStats.cost,
        quality_score: scores?.qualityScore || 0,
        readability_score: scores?.readabilityScore || 0,
        seo_score: scores?.seoScore || 0,
        keywords: keywords || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete generation', { error, generationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-create-v2')
    logger.info('Generation completed successfully', { generationId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in completeGeneration', { error, generationId })
    return actionError('An unexpected error occurred')
  }
}

export async function failGeneration(
  generationId: string,
  errorMessage: string
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(generationId)
    if (!validationResult.success) {
      return actionError('Invalid generation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to failGeneration', { generationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .update({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark generation as failed', { error, generationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-create-v2')
    logger.info('Generation marked as failed', { generationId, userId: user.id, errorMessage })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in failGeneration', { error, generationId })
    return actionError('An unexpected error occurred')
  }
}

export async function regenerate(generationId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(generationId)
    if (!validationResult.success) {
      return actionError('Invalid generation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to regenerate', { generationId })
      return actionError('Not authenticated')
    }

    const { data: original } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single()

    if (!original) {
      logger.warn('Generation not found for regeneration', { generationId, userId: user.id })
      return actionError('Generation not found')
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        title: `${original.title} (Regenerated)`,
        generation_type: original.generation_type,
        template: original.template,
        prompt: original.prompt,
        model: original.model,
        temperature: original.temperature,
        max_tokens: original.max_tokens,
        tags: original.tags,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to regenerate generation', { error, generationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-create-v2')
    logger.info('Generation regenerated successfully', { originalId: generationId, newId: data.id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in regenerate', { error, generationId })
    return actionError('An unexpected error occurred')
  }
}

export async function deleteGeneration(generationId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(generationId)
    if (!validationResult.success) {
      return actionError('Invalid generation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to deleteGeneration', { generationId })
      return actionError('Not authenticated')
    }

    const { error } = await supabase
      .from('ai_generations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', generationId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete generation', { error, generationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-create-v2')
    logger.info('Generation deleted successfully', { generationId, userId: user.id })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in deleteGeneration', { error, generationId })
    return actionError('An unexpected error occurred')
  }
}

export async function getGenerationStats(): Promise<ActionResult<GenerationStats | null>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getGenerationStats')
      return actionError('Not authenticated')
    }

    const { data: generations } = await supabase
      .from('ai_generations')
      .select('status, generation_type, total_tokens, cost, quality_score, latency_ms')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (!generations) {
      logger.info('No generations found for stats', { userId: user.id })
      return actionSuccess(null)
    }

    const completedGenerations = generations.filter(g => g.status === 'completed')

    const stats: GenerationStats = {
      total: generations.length,
      completed: generations.filter(g => g.status === 'completed').length,
      pending: generations.filter(g => g.status === 'pending' || g.status === 'processing').length,
      failed: generations.filter(g => g.status === 'failed').length,
      totalTokens: generations.reduce((sum, g) => sum + (g.total_tokens || 0), 0),
      totalCost: generations.reduce((sum, g) => sum + (g.cost || 0), 0),
      byType: generations.reduce((acc, g) => {
        acc[g.generation_type] = (acc[g.generation_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      avgQualityScore: completedGenerations.length > 0
        ? completedGenerations.reduce((sum, g) => sum + (g.quality_score || 0), 0) / completedGenerations.length
        : 0,
      avgLatency: completedGenerations.length > 0
        ? completedGenerations.reduce((sum, g) => sum + (g.latency_ms || 0), 0) / completedGenerations.length
        : 0
    }

    logger.info('Generation stats fetched successfully', { userId: user.id })
    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error in getGenerationStats', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function getTemplates(): Promise<ActionResult<Template[]>> {
  try {
    const templates: Template[] = [
      { id: 'blog-post', name: 'Blog Post', type: 'content', description: 'Generate a full blog post with introduction, body, and conclusion' },
      { id: 'product-description', name: 'Product Description', type: 'content', description: 'Create compelling product descriptions for e-commerce' },
      { id: 'email-newsletter', name: 'Email Newsletter', type: 'email', description: 'Draft engaging email newsletter content' },
      { id: 'social-media', name: 'Social Media Post', type: 'social', description: 'Create posts for various social platforms' },
      { id: 'code-function', name: 'Code Function', type: 'code', description: 'Generate code functions with documentation' },
      { id: 'seo-meta', name: 'SEO Meta Tags', type: 'seo', description: 'Generate optimized meta titles and descriptions' },
      { id: 'article-summary', name: 'Article Summary', type: 'summary', description: 'Summarize long articles into key points' },
      { id: 'ad-copy', name: 'Ad Copy', type: 'content', description: 'Create persuasive advertising copy' }
    ]

    logger.info('Templates fetched successfully')
    return actionSuccess(templates)
  } catch (error) {
    logger.error('Unexpected error in getTemplates', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function analyzeContent(content: string): Promise<ActionResult<ContentAnalysis>> {
  try {
    if (!content || content.trim().length === 0) {
      return actionError('Content is required for analysis')
    }

    const wordCount = content.split(/\s+/).length
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim()).length
    const avgWordsPerSentence = wordCount / (sentenceCount || 1)

    // Simple readability score (Flesch-like)
    const readabilityScore = Math.min(100, Math.max(0, 206.835 - (1.015 * avgWordsPerSentence)))

    // Simple SEO score based on content length and structure
    const seoScore = Math.min(100, Math.max(0,
      (wordCount >= 300 ? 30 : wordCount / 10) +
      (sentenceCount >= 10 ? 30 : sentenceCount * 3) +
      (content.includes('\n') ? 20 : 0) +
      (content.match(/[A-Z][a-z]+/g)?.length || 0 > 5 ? 20 : 0)
    ))

    // Quality score combining factors
    const qualityScore = Math.round((readabilityScore + seoScore) / 2)

    const analysis: ContentAnalysis = {
      wordCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      qualityScore
    }

    logger.info('Content analyzed successfully', { wordCount, qualityScore })
    return actionSuccess(analysis)
  } catch (error) {
    logger.error('Unexpected error in analyzeContent', { error })
    return actionError('An unexpected error occurred')
  }
}
