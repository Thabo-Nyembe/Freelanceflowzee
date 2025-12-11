import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import { kaziAI, type AITaskType } from '@/lib/ai/kazi-ai-router'

const logger = createFeatureLogger('API-AIGenerate')

interface GenerateRequest {
  prompt: string
  model?: string
  type: 'text' | 'image' | 'code' | 'email' | 'creative' | 'analysis'
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  userId?: string
}

// Map generation types to AI task types
const TYPE_TO_TASK: Record<string, AITaskType> = {
  text: 'creative',
  image: 'creative',
  code: 'coding',
  email: 'operational',
  creative: 'creative',
  analysis: 'analysis'
}

// System prompts for different content types
const SYSTEM_PROMPTS: Record<string, string> = {
  text: 'You are Kazi AI, an expert content writer. Generate high-quality, engaging content that is well-structured and professional.',
  image: 'You are Kazi AI, an expert creative director. Create detailed, vivid image descriptions that can be used for image generation.',
  code: 'You are Kazi AI, an expert software developer. Generate clean, well-documented, production-ready code with proper error handling and best practices.',
  email: 'You are Kazi AI, an expert business communicator. Write professional, clear, and effective emails that achieve their intended purpose.',
  creative: 'You are Kazi AI, an expert creative strategist. Generate innovative, engaging content that captures attention and delivers value.',
  analysis: 'You are Kazi AI, an expert analyst. Provide thorough, insightful analysis with clear conclusions and actionable recommendations.'
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    const {
      prompt,
      type,
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
      userId
    } = body

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required', success: false },
        { status: 400 }
      )
    }

    if (!type || !TYPE_TO_TASK[type]) {
      return NextResponse.json(
        { error: 'Invalid type. Supported: text, image, code, email, creative, analysis', success: false },
        { status: 400 }
      )
    }

    if (prompt.length > 10000) {
      return NextResponse.json(
        { error: 'Prompt too long. Maximum 10,000 characters.', success: false },
        { status: 400 }
      )
    }

    logger.info('AI Generate request', {
      type,
      promptLength: prompt.length,
      userId
    })

    // Use real AI router
    const taskType = TYPE_TO_TASK[type]
    const finalSystemPrompt = systemPrompt || SYSTEM_PROMPTS[type]

    const response = await kaziAI.routeRequest({
      type: taskType,
      prompt,
      systemPrompt: finalSystemPrompt,
      maxTokens,
      temperature,
      userId
    })

    return NextResponse.json({
      success: true,
      result: response.content,
      metadata: {
        provider: response.provider,
        model: response.model,
        type,
        usage: {
          prompt_tokens: response.tokens.input,
          completion_tokens: response.tokens.output,
          total_tokens: response.tokens.total
        },
        cost: response.cost,
        duration: response.duration,
        cached: response.cached || false,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('AI generation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        error: 'AI service temporarily unavailable. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/ai/generate',
    available_models: [
      'gpt-4-turbo-preview',
      'gpt-4o',
      'claude-3-5-sonnet-20241022',
      'gemini-pro'
    ],
    supported_types: ['text', 'image', 'code', 'email', 'creative', 'analysis'],
    version: '2.0.0'
  })
}
