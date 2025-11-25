/**
 * KAZI AI CHAT API
 * Universal chat endpoint for AI interactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { kaziAI, AITaskType } from '@/lib/ai/kazi-ai-router'
import { investorAnalytics } from '@/lib/ai/investor-analytics'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('KaziAI-API')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      message,
      taskType = 'chat' as AITaskType,
      context,
      userId,
      systemPrompt
    } = body

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    logger.info('AI chat request', {
      userId,
      taskType,
      messageLength: message.length
    })

    // Track event for investor analytics
    if (userId) {
      investorAnalytics.trackEvent({
        userId,
        eventType: 'ai_interaction',
        eventData: {
          taskType,
          messageLength: message.length,
          hasContext: !!context
        },
        timestamp: new Date()
      })
    }

    // Route request through Kazi AI
    const response = await kaziAI.routeRequest({
      type: taskType,
      prompt: message,
      systemPrompt,
      context,
      userId
    })

    logger.info('AI chat response', {
      userId,
      provider: response.provider,
      tokens: response.tokens.total,
      cost: response.cost,
      cached: response.cached
    })

    return NextResponse.json({
      success: true,
      response: response.content,
      metadata: {
        provider: response.provider,
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        duration: response.duration,
        cached: response.cached
      }
    })

  } catch (error) {
    logger.error('AI chat error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: 'healthy',
    service: 'kazi-ai-chat',
    timestamp: new Date().toISOString()
  })
}
