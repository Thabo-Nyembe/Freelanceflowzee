'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getGenerations(options?: {
  generationType?: string
  status?: string
  template?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  return { data }
}

export async function getGeneration(generationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createGeneration(generationData: {
  title?: string
  generation_type?: string
  template?: string
  prompt: string
  model?: string
  temperature?: number
  max_tokens?: number
  tags?: string[]
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-create-v2')
  return { data }
}

export async function updateGeneration(
  generationId: string,
  updates: {
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
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-create-v2')
  return { data }
}

export async function completeGeneration(
  generationId: string,
  result: string,
  tokenStats: {
    promptTokens: number
    completionTokens: number
    latencyMs: number
    cost: number
  },
  scores?: {
    qualityScore?: number
    readabilityScore?: number
    seoScore?: number
  },
  keywords?: string[]
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-create-v2')
  return { data }
}

export async function failGeneration(generationId: string, errorMessage: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-create-v2')
  return { data }
}

export async function regenerate(generationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get original generation
  const { data: original } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single()

  if (!original) {
    return { error: 'Generation not found' }
  }

  // Create new generation based on original
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-create-v2')
  return { data }
}

export async function deleteGeneration(generationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('ai_generations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', generationId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-create-v2')
  return { success: true }
}

export async function getGenerationStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: generations } = await supabase
    .from('ai_generations')
    .select('status, generation_type, total_tokens, cost, quality_score, latency_ms')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!generations) {
    return { data: null }
  }

  const completedGenerations = generations.filter(g => g.status === 'completed')

  const stats = {
    total: generations.length,
    completed: generations.filter(g => g.status === 'completed').length,
    pending: generations.filter(g => g.status === 'pending' || g.status === 'processing').length,
    failed: generations.filter(g => g.status === 'failed').length,
    totalTokens: generations.reduce((sum, g) => sum + g.total_tokens, 0),
    totalCost: generations.reduce((sum, g) => sum + g.cost, 0),
    byType: generations.reduce((acc, g) => {
      acc[g.generation_type] = (acc[g.generation_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    avgQualityScore: completedGenerations.length > 0
      ? completedGenerations.reduce((sum, g) => sum + g.quality_score, 0) / completedGenerations.length
      : 0,
    avgLatency: completedGenerations.length > 0
      ? completedGenerations.reduce((sum, g) => sum + g.latency_ms, 0) / completedGenerations.length
      : 0
  }

  return { data: stats }
}

export async function getTemplates() {
  // Return available content generation templates
  return {
    data: [
      { id: 'blog-post', name: 'Blog Post', type: 'content', description: 'Generate a full blog post with introduction, body, and conclusion' },
      { id: 'product-description', name: 'Product Description', type: 'content', description: 'Create compelling product descriptions for e-commerce' },
      { id: 'email-newsletter', name: 'Email Newsletter', type: 'email', description: 'Draft engaging email newsletter content' },
      { id: 'social-media', name: 'Social Media Post', type: 'social', description: 'Create posts for various social platforms' },
      { id: 'code-function', name: 'Code Function', type: 'code', description: 'Generate code functions with documentation' },
      { id: 'seo-meta', name: 'SEO Meta Tags', type: 'seo', description: 'Generate optimized meta titles and descriptions' },
      { id: 'article-summary', name: 'Article Summary', type: 'summary', description: 'Summarize long articles into key points' },
      { id: 'ad-copy', name: 'Ad Copy', type: 'content', description: 'Create persuasive advertising copy' }
    ]
  }
}

export async function analyzeContent(content: string) {
  // Analyze generated content for quality metrics
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

  return {
    data: {
      wordCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      qualityScore
    }
  }
}
