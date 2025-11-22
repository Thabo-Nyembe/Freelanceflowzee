/**
 * AI CREATE A++++ - MODEL COMPARISON UTILITY
 *
 * Enables side-by-side comparison of outputs from multiple AI models.
 * Helps users choose the best model for their specific needs.
 *
 * Features:
 * - Generate with multiple models simultaneously
 * - Side-by-side result visualization
 * - Quality scoring and ranking
 * - Cost-benefit analysis
 * - Performance metrics comparison
 * - Export comparison reports
 *
 * @example
 * ```typescript
 * const comparison = await compareModels({
 *   prompt: 'Write a blog post about AI...',
 *   models: ['gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-pro'],
 *   temperature: 0.7,
 *   maxTokens: 1000
 * })
 *
 * console.log('Best model:', comparison.ranked[0].model)
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ComparisonRequest {
  prompt: string
  models: string[]
  temperature?: number
  maxTokens?: number
  parallelExecution?: boolean
  onProgress?: (update: ComparisonProgress) => void
}

export interface ComparisonResult {
  id: string
  prompt: string
  timestamp: Date
  outputs: ModelOutput[]
  ranked: RankedOutput[]
  analysis: ComparisonAnalysis
}

export interface ModelOutput {
  model: string
  content: string
  metadata: OutputMetadata
  metrics: OutputMetrics
  errors?: string[]
}

export interface OutputMetadata {
  tokensUsed: number
  cost: number
  responseTime: number
  finishReason?: string
}

export interface OutputMetrics {
  wordCount: number
  characterCount: number
  sentenceCount: number
  paragraphCount: number
  readabilityScore?: number
  seoScore?: number
  uniqueness: number
}

export interface RankedOutput extends ModelOutput {
  rank: number
  overallScore: number
  scoreBreakdown: ScoreBreakdown
}

export interface ScoreBreakdown {
  quality: number
  speed: number
  cost: number
  completeness: number
  readability: number
  relevance: number
}

export interface ComparisonAnalysis {
  bestOverall: string
  bestForQuality: string
  bestForSpeed: string
  bestForCost: string
  averageResponseTime: number
  totalCost: number
  recommendations: string[]
}

export interface ComparisonProgress {
  stage: 'preparing' | 'generating' | 'analyzing' | 'complete'
  completedModels: number
  totalModels: number
  currentModel?: string
  percentage: number
}

// ============================================================================
// MODEL COMPARISON ENGINE
// ============================================================================

/**
 * Compares outputs from multiple AI models for the same prompt
 *
 * @param request - Comparison request configuration
 * @returns Detailed comparison results with rankings
 */
export async function compareModels(
  request: ComparisonRequest
): Promise<ComparisonResult> {
  const {
    prompt,
    models,
    temperature = 0.7,
    maxTokens = 1000,
    parallelExecution = true,
    onProgress
  } = request

  const comparisonId = `comp-${Date.now()}`
  const outputs: ModelOutput[] = []

  // Update progress: preparing
  onProgress?.({
    stage: 'preparing',
    completedModels: 0,
    totalModels: models.length,
    percentage: 0
  })

  try {
    // Generate content from each model
    if (parallelExecution) {
      // Generate in parallel for speed
      const promises = models.map(model =>
        generateWithModel(model, prompt, temperature, maxTokens)
      )

      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        const model = models[index]

        if (result.status === 'fulfilled') {
          outputs.push(result.value)
        } else {
          // Handle error by creating a failed output
          outputs.push({
            model,
            content: '',
            metadata: {
              tokensUsed: 0,
              cost: 0,
              responseTime: 0
            },
            metrics: {
              wordCount: 0,
              characterCount: 0,
              sentenceCount: 0,
              paragraphCount: 0,
              uniqueness: 0
            },
            errors: [result.reason?.message || 'Unknown error']
          })
        }

        // Update progress after each model
        onProgress?.({
          stage: 'generating',
          completedModels: index + 1,
          totalModels: models.length,
          currentModel: model,
          percentage: ((index + 1) / models.length) * 70 // 70% for generation
        })
      })
    } else {
      // Generate sequentially for rate limit compliance
      for (let i = 0; i < models.length; i++) {
        const model = models[i]

        onProgress?.({
          stage: 'generating',
          completedModels: i,
          totalModels: models.length,
          currentModel: model,
          percentage: (i / models.length) * 70
        })

        try {
          const output = await generateWithModel(model, prompt, temperature, maxTokens)
          outputs.push(output)
        } catch (error: any) {
          outputs.push({
            model,
            content: '',
            metadata: {
              tokensUsed: 0,
              cost: 0,
              responseTime: 0
            },
            metrics: {
              wordCount: 0,
              characterCount: 0,
              sentenceCount: 0,
              paragraphCount: 0,
              uniqueness: 0
            },
            errors: [error.message || 'Unknown error']
          })
        }

        onProgress?.({
          stage: 'generating',
          completedModels: i + 1,
          totalModels: models.length,
          currentModel: model,
          percentage: ((i + 1) / models.length) * 70
        })
      }
    }

    // Update progress: analyzing
    onProgress?.({
      stage: 'analyzing',
      completedModels: models.length,
      totalModels: models.length,
      percentage: 80
    })

    // Rank outputs
    const ranked = rankOutputs(outputs, prompt)

    // Generate analysis
    const analysis = analyzeComparison(outputs, ranked)

    // Update progress: complete
    onProgress?.({
      stage: 'complete',
      completedModels: models.length,
      totalModels: models.length,
      percentage: 100
    })

    return {
      id: comparisonId,
      prompt,
      timestamp: new Date(),
      outputs,
      ranked,
      analysis
    }
  } catch (error) {
    console.error('Model comparison failed:', error)
    throw error
  }
}

// ============================================================================
// MODEL GENERATION
// ============================================================================

/**
 * Generates content from a specific model
 */
async function generateWithModel(
  model: string,
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<ModelOutput> {
  const startTime = Date.now()

  try {
    const response = await fetch('/api/ai/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature,
        maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const responseTime = Date.now() - startTime

    const content = data.content || ''
    const tokensUsed = data.tokens || 0
    const cost = calculateCost(model, tokensUsed)

    // Calculate metrics
    const metrics = calculateMetrics(content)

    return {
      model,
      content,
      metadata: {
        tokensUsed,
        cost,
        responseTime,
        finishReason: data.finishReason
      },
      metrics
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    throw new Error(`${model} failed: ${error.message}`)
  }
}

/**
 * Calculates cost for a model based on token usage
 */
function calculateCost(model: string, tokens: number): number {
  // Cost per 1K tokens (approximate rates as of 2024)
  const costPer1k: Record<string, number> = {
    'gpt-4o-mini': 0.0002,
    'gpt-4o': 0.005,
    'gpt-4-turbo': 0.01,
    'gpt-3.5-turbo': 0.0015,
    'claude-3-5-sonnet': 0.003,
    'claude-3-opus': 0.015,
    'claude-3-haiku': 0.00025,
    'gemini-pro': 0.00025,
    'gemini-1.5-pro': 0.0035,
    'mistral-medium': 0.0027,
    'mistral-large': 0.008
  }

  const rate = costPer1k[model] || 0.002 // Default fallback
  return (tokens / 1000) * rate
}

/**
 * Calculates content metrics
 */
function calculateMetrics(content: string): OutputMetrics {
  const words = content.split(/\s+/).filter(w => w.length > 0)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)

  return {
    wordCount: words.length,
    characterCount: content.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    uniqueness: calculateUniqueness(words)
  }
}

/**
 * Calculates uniqueness ratio (unique words / total words)
 */
function calculateUniqueness(words: string[]): number {
  if (words.length === 0) return 0
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  return uniqueWords.size / words.length
}

// ============================================================================
// RANKING & SCORING
// ============================================================================

/**
 * Ranks model outputs based on multiple criteria
 */
function rankOutputs(outputs: ModelOutput[], prompt: string): RankedOutput[] {
  const ranked: RankedOutput[] = outputs.map(output => {
    const scoreBreakdown = calculateScoreBreakdown(output, prompt, outputs)
    const overallScore = calculateOverallScore(scoreBreakdown)

    return {
      ...output,
      rank: 0, // Will be assigned after sorting
      overallScore,
      scoreBreakdown
    }
  })

  // Sort by overall score (descending)
  ranked.sort((a, b) => b.overallScore - a.overallScore)

  // Assign ranks
  ranked.forEach((output, index) => {
    output.rank = index + 1
  })

  return ranked
}

/**
 * Calculates score breakdown for an output
 */
function calculateScoreBreakdown(
  output: ModelOutput,
  prompt: string,
  allOutputs: ModelOutput[]
): ScoreBreakdown {
  // Quality score (based on length, completeness, errors)
  let quality = 70
  if (output.errors && output.errors.length > 0) {
    quality = 0
  } else {
    if (output.metrics.wordCount >= 100) quality += 10
    if (output.metrics.paragraphCount >= 3) quality += 10
    if (output.metrics.uniqueness >= 0.5) quality += 10
  }

  // Speed score (faster is better)
  const maxResponseTime = Math.max(...allOutputs.map(o => o.metadata.responseTime))
  const speed = maxResponseTime > 0
    ? 100 - ((output.metadata.responseTime / maxResponseTime) * 100) * 0.7
    : 50

  // Cost score (cheaper is better)
  const maxCost = Math.max(...allOutputs.map(o => o.metadata.cost))
  const cost = maxCost > 0
    ? 100 - ((output.metadata.cost / maxCost) * 100) * 0.7
    : 50

  // Completeness score
  const completeness = output.metadata.finishReason === 'length'
    ? 70 // Hit token limit
    : 100 // Completed naturally

  // Readability score (based on sentence/paragraph structure)
  let readability = 50
  if (output.metrics.wordCount > 0) {
    const avgWordsPerSentence = output.metrics.wordCount / Math.max(output.metrics.sentenceCount, 1)
    const avgWordsPerParagraph = output.metrics.wordCount / Math.max(output.metrics.paragraphCount, 1)

    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25) readability += 25
    if (avgWordsPerParagraph >= 50 && avgWordsPerParagraph <= 150) readability += 25
  }

  // Relevance score (simple keyword matching with prompt)
  const relevance = calculateRelevance(output.content, prompt)

  return {
    quality: Math.min(100, quality),
    speed: Math.min(100, speed),
    cost: Math.min(100, cost),
    completeness,
    readability,
    relevance
  }
}

/**
 * Calculates overall score from breakdown
 */
function calculateOverallScore(breakdown: ScoreBreakdown): number {
  // Weighted average
  const weights = {
    quality: 0.3,
    speed: 0.15,
    cost: 0.15,
    completeness: 0.2,
    readability: 0.1,
    relevance: 0.1
  }

  return (
    breakdown.quality * weights.quality +
    breakdown.speed * weights.speed +
    breakdown.cost * weights.cost +
    breakdown.completeness * weights.completeness +
    breakdown.readability * weights.readability +
    breakdown.relevance * weights.relevance
  )
}

/**
 * Calculates relevance of content to prompt
 */
function calculateRelevance(content: string, prompt: string): number {
  const promptWords = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const contentLower = content.toLowerCase()

  let matchCount = 0
  promptWords.forEach(word => {
    if (contentLower.includes(word)) matchCount++
  })

  return promptWords.length > 0
    ? (matchCount / promptWords.length) * 100
    : 50
}

// ============================================================================
// ANALYSIS
// ============================================================================

/**
 * Analyzes comparison results and generates insights
 */
function analyzeComparison(
  outputs: ModelOutput[],
  ranked: RankedOutput[]
): ComparisonAnalysis {
  const validOutputs = outputs.filter(o => !o.errors || o.errors.length === 0)

  if (validOutputs.length === 0) {
    return {
      bestOverall: 'None',
      bestForQuality: 'None',
      bestForSpeed: 'None',
      bestForCost: 'None',
      averageResponseTime: 0,
      totalCost: 0,
      recommendations: ['All models failed. Please check your configuration.']
    }
  }

  const bestOverall = ranked[0].model

  const bestForQuality = ranked.reduce((best, current) =>
    current.scoreBreakdown.quality > best.scoreBreakdown.quality ? current : best
  ).model

  const bestForSpeed = ranked.reduce((best, current) =>
    current.scoreBreakdown.speed > best.scoreBreakdown.speed ? current : best
  ).model

  const bestForCost = ranked.reduce((best, current) =>
    current.scoreBreakdown.cost > best.scoreBreakdown.cost ? current : best
  ).model

  const averageResponseTime = validOutputs.reduce((sum, o) => sum + o.metadata.responseTime, 0) / validOutputs.length
  const totalCost = outputs.reduce((sum, o) => sum + o.metadata.cost, 0)

  const recommendations = generateRecommendations(ranked, averageResponseTime, totalCost)

  return {
    bestOverall,
    bestForQuality,
    bestForSpeed,
    bestForCost,
    averageResponseTime,
    totalCost,
    recommendations
  }
}

/**
 * Generates actionable recommendations based on comparison
 */
function generateRecommendations(
  ranked: RankedOutput[],
  avgResponseTime: number,
  totalCost: number
): string[] {
  const recommendations: string[] = []

  const best = ranked[0]

  recommendations.push(`🏆 Overall winner: ${best.model} (score: ${best.overallScore.toFixed(1)}/100)`)

  if (best.scoreBreakdown.quality >= 90) {
    recommendations.push(`✨ Excellent quality output from ${best.model}`)
  }

  if (best.metadata.responseTime < 2000) {
    recommendations.push(`⚡ Fast response time: ${best.metadata.responseTime}ms`)
  }

  if (best.metadata.cost < 0.001) {
    recommendations.push(`💰 Very cost-effective: $${best.metadata.cost.toFixed(6)} per generation`)
  }

  // Check if there's a significantly cheaper option
  const cheapest = ranked.reduce((min, curr) =>
    curr.metadata.cost < min.metadata.cost ? curr : min
  )

  if (cheapest.model !== best.model && cheapest.overallScore >= best.overallScore * 0.9) {
    recommendations.push(`💡 Consider ${cheapest.model} for similar quality at lower cost`)
  }

  // Check if any model failed
  const failedCount = ranked.filter(r => r.errors && r.errors.length > 0).length
  if (failedCount > 0) {
    recommendations.push(`⚠️ ${failedCount} model(s) failed to generate content`)
  }

  return recommendations
}

// ============================================================================
// EXPORT & STORAGE
// ============================================================================

const STORAGE_KEY = 'ai-create-comparisons'

/**
 * Saves comparison result to localStorage
 */
export function saveComparison(comparison: ComparisonResult): boolean {
  try {
    const existing = loadComparisons()
    existing.unshift(comparison)

    // Keep last 50 comparisons
    const trimmed = existing.slice(0, 50)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch (error) {
    console.error('Failed to save comparison:', error)
    return false
  }
}

/**
 * Loads all saved comparisons
 */
export function loadComparisons(): ComparisonResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load comparisons:', error)
    return []
  }
}

/**
 * Exports comparison as JSON
 */
export function exportComparison(comparison: ComparisonResult): string {
  return JSON.stringify(comparison, null, 2)
}

/**
 * Exports comparison as markdown report
 */
export function exportComparisonAsMarkdown(comparison: ComparisonResult): string {
  let md = `# AI Model Comparison Report\n\n`
  md += `**Date:** ${comparison.timestamp.toLocaleString()}\n\n`
  md += `**Prompt:** ${comparison.prompt}\n\n`
  md += `---\n\n`

  md += `## 📊 Rankings\n\n`
  comparison.ranked.forEach(output => {
    md += `### ${output.rank}. ${output.model}\n`
    md += `**Overall Score:** ${output.overallScore.toFixed(1)}/100\n\n`
    md += `**Breakdown:**\n`
    md += `- Quality: ${output.scoreBreakdown.quality}/100\n`
    md += `- Speed: ${output.scoreBreakdown.speed}/100\n`
    md += `- Cost: ${output.scoreBreakdown.cost}/100\n`
    md += `- Completeness: ${output.scoreBreakdown.completeness}/100\n`
    md += `- Readability: ${output.scoreBreakdown.readability}/100\n`
    md += `- Relevance: ${output.scoreBreakdown.relevance}/100\n\n`
    md += `**Metrics:**\n`
    md += `- Words: ${output.metrics.wordCount}\n`
    md += `- Response Time: ${output.metadata.responseTime}ms\n`
    md += `- Cost: $${output.metadata.cost.toFixed(6)}\n\n`
  })

  md += `---\n\n`
  md += `## 🎯 Analysis\n\n`
  md += `- **Best Overall:** ${comparison.analysis.bestOverall}\n`
  md += `- **Best Quality:** ${comparison.analysis.bestForQuality}\n`
  md += `- **Fastest:** ${comparison.analysis.bestForSpeed}\n`
  md += `- **Most Cost-Effective:** ${comparison.analysis.bestForCost}\n`
  md += `- **Average Response Time:** ${comparison.analysis.averageResponseTime.toFixed(0)}ms\n`
  md += `- **Total Cost:** $${comparison.analysis.totalCost.toFixed(6)}\n\n`

  md += `## 💡 Recommendations\n\n`
  comparison.analysis.recommendations.forEach(rec => {
    md += `- ${rec}\n`
  })

  return md
}
