import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const logger = createFeatureLogger('API-AIStreamText')

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

// OpenRouter client (uses OpenAI SDK with custom base URL)
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9323',
    'X-Title': 'Kazi AI Platform'
  }
})

interface StreamRequest {
  prompt: string
  model?: string
  provider?: 'openai' | 'anthropic' | 'openrouter'
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: StreamRequest = await request.json()

    const {
      prompt,
      model,
      provider = 'openrouter', // Default to OpenRouter for free models
      systemPrompt = 'You are Kazi AI, an expert assistant for freelancers and creative professionals.',
      temperature = 0.7,
      maxTokens = 2000,
      stream = true
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    logger.info('Stream text request', {
      provider,
      model,
      promptLength: prompt.length,
      stream
    })

    // Non-streaming response
    if (!stream) {
      const response = await generateNonStreaming(prompt, provider, model, systemPrompt, temperature, maxTokens)
      return NextResponse.json(response)
    }

    // Streaming response
    const readable = await createStreamingResponse(prompt, provider, model, systemPrompt, temperature, maxTokens)

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    logger.error('Stream text API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        error: 'AI streaming service temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Create streaming response based on provider
async function createStreamingResponse(
  prompt: string,
  provider: string,
  model: string | undefined,
  systemPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
          // Anthropic streaming
          const stream = await anthropic.messages.stream({
            model: model || 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }]
          })

          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const data = JSON.stringify({
                type: 'text',
                content: event.delta.text
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Send completion event
          const finalMessage = await stream.finalMessage()
          const doneData = JSON.stringify({
            type: 'done',
            usage: {
              input_tokens: finalMessage.usage.input_tokens,
              output_tokens: finalMessage.usage.output_tokens
            }
          })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

        } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
          // OpenAI streaming
          const stream = await openai.chat.completions.create({
            model: model || 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens,
            stream: true
          })

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              const data = JSON.stringify({
                type: 'text',
                content
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          const doneData = JSON.stringify({ type: 'done' })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

        } else if (process.env.OPENROUTER_API_KEY) {
          // OpenRouter streaming (default)
          const stream = await openrouter.chat.completions.create({
            model: model || 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens,
            stream: true
          })

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              const data = JSON.stringify({
                type: 'text',
                content
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          const doneData = JSON.stringify({ type: 'done' })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))

        } else {
          // No API keys configured - send error
          const errorData = JSON.stringify({
            type: 'error',
            content: 'No AI provider configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY.'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        }

        controller.close()
      } catch (error) {
        logger.error('Streaming error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        const errorData = JSON.stringify({
          type: 'error',
          content: error instanceof Error ? error.message : 'Streaming failed'
        })
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        controller.close()
      }
    }
  })
}

// Generate non-streaming response
async function generateNonStreaming(
  prompt: string,
  provider: string,
  model: string | undefined,
  systemPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<Record<string, unknown>> {
  let content = ''
  let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  let usedModel = model

  try {
    if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })

      content = response.content[0].type === 'text' ? response.content[0].text : ''
      usage = {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
      usedModel = response.model

    } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: model || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      })

      content = response.choices[0]?.message?.content || ''
      usage = {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0
      }
      usedModel = response.model

    } else if (process.env.OPENROUTER_API_KEY) {
      const response = await openrouter.chat.completions.create({
        model: model || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      })

      content = response.choices[0]?.message?.content || ''
      usage = {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0
      }
      usedModel = response.model
    }
  } catch (error) {
    logger.error('Non-streaming error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }

  return {
    id: `text-${Date.now()}`,
    text: content,
    model: usedModel,
    provider,
    temperature,
    usage,
    timestamp: new Date().toISOString()
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/ai/stream-text',
    version: '2.0.0',
    capabilities: ['streaming', 'text-generation', 'real-time', 'multi-provider'],
    providers: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY
    },
    timestamp: new Date().toISOString()
  })
}
