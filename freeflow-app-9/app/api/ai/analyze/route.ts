import { NextRequest, NextResponse } from 'next/server';
import { createFeatureLogger } from '@/lib/logger'
import { kaziAI, type AITaskType } from '@/lib/ai/kazi-ai-router'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('API-AIAnalyze')

interface AnalyzeRequest {
  data: string | Record<string, unknown>
  type?: 'general' | 'document' | 'code' | 'business' | 'sentiment' | 'market'
  context?: string
  userId?: string
}

// System prompts for different analysis types
const ANALYSIS_PROMPTS: Record<string, string> = {
  general: `You are Kazi AI, an expert analyst. Analyze the provided data and provide:
1. A clear summary of key findings
2. 3-5 specific insights with actionable value
3. 2-3 recommendations for improvement
4. An overall quality/performance score (0-100)

Format your response as structured analysis with clear sections.`,

  document: `You are Kazi AI, an expert document analyst. Analyze this document and provide:
1. Document summary and key points
2. Quality assessment (clarity, structure, completeness)
3. Potential issues or gaps
4. Improvement suggestions
5. Overall score (0-100)`,

  code: `You are Kazi AI, an expert code reviewer. Analyze this code and provide:
1. Code quality assessment
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Best practice recommendations
6. Overall quality score (0-100)`,

  business: `You are Kazi AI, an expert business strategist. Analyze this business data and provide:
1. Key performance insights
2. Opportunities for growth
3. Risk assessment
4. Strategic recommendations
5. Overall health score (0-100)`,

  sentiment: `You are Kazi AI, an expert sentiment analyst. Analyze the sentiment and provide:
1. Overall sentiment (positive/negative/neutral with confidence %)
2. Key emotional themes detected
3. Notable phrases or patterns
4. Audience perception insights
5. Sentiment score (-100 to +100)`,

  market: `You are Kazi AI, an expert market analyst. Analyze this market data and provide:
1. Market position assessment
2. Competitive landscape insights
3. Trend analysis
4. Opportunity areas
5. Risk factors
6. Market potential score (0-100)`
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    const {
      data,
      type = 'general',
      context,
      userId
    } = body

    // Validate input
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data to analyze is required' },
        { status: 400 }
      )
    }

    // Convert data to string if object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

    if (dataString.length > 50000) {
      return NextResponse.json(
        { success: false, error: 'Data too large. Maximum 50,000 characters.' },
        { status: 400 }
      )
    }

    logger.info('AI Analyze request', {
      type,
      dataLength: dataString.length,
      userId
    })

    // Build the analysis prompt
    const systemPrompt = ANALYSIS_PROMPTS[type] || ANALYSIS_PROMPTS.general
    const prompt = context
      ? `Context: ${context}\n\nData to analyze:\n${dataString}`
      : `Analyze the following:\n${dataString}`

    // Use real AI router
    const response = await kaziAI.routeRequest({
      type: 'analysis' as AITaskType,
      prompt,
      systemPrompt,
      maxTokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent analysis
      userId
    })

    // Parse the response to extract structured data
    const parsed = parseAnalysisResponse(response.content)

    return NextResponse.json({
      success: true,
      results: {
        analysis: response.content,
        insights: parsed.insights,
        recommendations: parsed.recommendations,
        score: parsed.score,
        type
      },
      metadata: {
        provider: response.provider,
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        duration: response.duration,
        cached: response.cached || false
      }
    });
  } catch (error) {
    logger.error('AI Analyze error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: 'AI service temporarily unavailable. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Parse AI response to extract structured elements
function parseAnalysisResponse(content: string): {
  insights: string[]
  recommendations: string[]
  score: number
} {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 75 // Default score

  const lines = content.split('\n')
  let currentSection = ''

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()

    // Detect sections
    if (trimmed.includes('insight') || trimmed.includes('finding') || trimmed.includes('key point')) {
      currentSection = 'insights'
      continue
    }
    if (trimmed.includes('recommendation') || trimmed.includes('suggestion') || trimmed.includes('improvement')) {
      currentSection = 'recommendations'
      continue
    }

    // Extract score
    const scoreMatch = line.match(/(?:score|rating)[:\s]*(\d+)/i)
    if (scoreMatch) {
      const parsedScore = parseInt(scoreMatch[1], 10)
      if (parsedScore >= 0 && parsedScore <= 100) {
        score = parsedScore
      }
    }

    // Extract bullet points
    const bulletMatch = line.match(/^[-*•\d.]+\s*(.+)/)
    if (bulletMatch && bulletMatch[1].length > 10) {
      const item = bulletMatch[1].trim()
      if (currentSection === 'insights' && insights.length < 5) {
        insights.push(item)
      } else if (currentSection === 'recommendations' && recommendations.length < 3) {
        recommendations.push(item)
      }
    }
  }

  // Ensure we have some content
  if (insights.length === 0) {
    insights.push('Analysis complete - see full response for details')
  }
  if (recommendations.length === 0) {
    recommendations.push('Review the analysis for actionable next steps')
  }

  return { insights, recommendations, score }
}

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/ai/analyze',
    supported_types: ['general', 'document', 'code', 'business', 'sentiment', 'market'],
    version: '2.0.0'
  })
}
