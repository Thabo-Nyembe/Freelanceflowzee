import { NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('API-GenerateContent')

export async function POST(request: Request) {
  try {
    const { model, prompt, temperature = 0.7, maxTokens = 1000 } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Map model names to OpenRouter format
    const modelMap: Record<string, string> = {
      'gpt-4o': 'openai/gpt-4o',
      'gpt-4o-mini': 'openai/gpt-4o-mini',
      'gpt-4-vision': 'openai/gpt-4-vision-preview',
      'claude-3-5-sonnet': 'anthropic/claude-3.5-sonnet',
      'claude-3-haiku': 'anthropic/claude-3-haiku',
      'gemini-pro': 'google/gemini-pro',
      'gemini-ultra': 'google/gemini-ultra',
      'dall-e-3': 'openai/dall-e-3',
      'midjourney-v6': 'midjourney/v6',
      'stable-diffusion-xl': 'stability-ai/sdxl',
      'runway-gen3': 'runway/gen-3',
      'real-esrgan': 'tencent/real-esrgan'
    }

    const openRouterModel = modelMap[model] || 'anthropic/claude-3-haiku'

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:9323',
        'X-Title': 'KAZI Platform - AI Create'
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that generates high-quality content based on user prompts. Follow the instructions carefully and provide well-structured, engaging content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    const generatedContent = data.choices[0]?.message?.content || 'No content generated'
    const tokensUsed = data.usage?.total_tokens || 0

    return NextResponse.json({
      success: true,
      content: generatedContent,
      tokens: tokensUsed,
      cost: (tokensUsed / 1000) * 0.002,
      model: openRouterModel
    })

  } catch (error) {
    logger.error('AI Generate Content Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate content'
      },
      { status: 500 }
    )
  }
}
