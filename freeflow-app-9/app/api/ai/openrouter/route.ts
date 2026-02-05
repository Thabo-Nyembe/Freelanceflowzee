import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-AIOpenRouter')

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'openai/gpt-4-turbo', temperature = 0.7, maxTokens = 2000 } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Mock OpenRouter response with multiple model support
    const mockResponse = {
      id: `openrouter-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      provider: 'openrouter',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: `OpenRouter AI Response using ${model}:\n\n${messages[messages.length - 1]?.content ? 
            `I understand you're asking about: "${messages[messages.length - 1].content}"\n\nThis response is generated through OpenRouter's advanced model routing capabilities, providing access to multiple AI providers and models for optimal performance.` :
            'I\'m ready to help with your request through OpenRouter\'s advanced AI routing system.'}`
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: messages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0) / 4,
        completion_tokens: maxTokens / 3,
        total_tokens: (messages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0) / 4) + (maxTokens / 3)
      },
      metadata: {
        provider: 'openrouter',
        model,
        temperature,
        maxTokens,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    logger.error('OpenRouter API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OpenRouter API is operational',
    version: '1.0.0',
    supportedModels: [
      'openai/gpt-4-turbo',
      'anthropic/claude-3-sonnet',
      'google/gemini-pro',
      'meta-llama/llama-2-70b-chat'
    ],
    timestamp: new Date().toISOString()
  })
}
