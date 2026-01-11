import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const logger = createFeatureLogger('API-AIAssistantChat')

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9323',
        'X-Title': 'Kazi AI Platform'
      }
    })
  : null

// Initialize Supabase client for server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  message: string
  conversationId: string
  mode?: 'chat' | 'code' | 'creative' | 'analysis'
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  includeHistory?: boolean
  historyLimit?: number
}

// Model mapping for different providers and modes
const modelConfig = {
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  'gpt-4-turbo': { provider: 'openai', model: 'gpt-4-turbo-preview' },
  'gpt-3.5-turbo': { provider: 'openai', model: 'gpt-3.5-turbo' },
  'claude-3-opus': { provider: 'anthropic', model: 'claude-3-opus-20240229' },
  'claude-3-sonnet': { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  'claude-3-haiku': { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  'llama-3': { provider: 'openrouter', model: 'meta-llama/llama-3.1-8b-instruct:free' },
} as const

// System prompts for different modes
const modeSystemPrompts: Record<string, string> = {
  chat: `You are Kazi AI, an intelligent and friendly assistant for freelancers and creative professionals.
You help with:
- Business advice and strategy
- Productivity tips
- Client communication
- Project management
- General questions

Be concise, helpful, and professional. Format responses with markdown when appropriate.`,

  code: `You are Kazi AI Code Assistant, an expert programmer who helps with:
- Code review and debugging
- Best practices and design patterns
- Performance optimization
- Security considerations
- Testing strategies

Always provide code examples with proper syntax highlighting using markdown code blocks.
Explain your reasoning and suggest improvements.`,

  creative: `You are Kazi AI Creative Partner, a creative collaborator who helps with:
- Brainstorming ideas
- Content creation (blogs, social media, marketing copy)
- Writing improvement and editing
- Creative problem-solving
- Brand voice development

Be imaginative, inspiring, and provide multiple creative options when relevant.`,

  analysis: `You are Kazi AI Data Analyst, an expert at:
- Data interpretation and insights
- Business analytics
- Market research
- Performance metrics analysis
- Strategic recommendations based on data

Be precise, data-driven, and provide actionable insights. Use structured formats for clarity.`
}

// Fetch conversation history from Supabase
async function getConversationHistory(
  conversationId: string,
  limit: number = 20
): Promise<ChatMessage[]> {
  if (!supabase) {
    logger.warn('Supabase not configured, skipping history fetch')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch conversation history', { error: error.message })
      return []
    }

    return (data || []).map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }))
  } catch (err) {
    logger.error('Error fetching history', { error: err instanceof Error ? err.message : 'Unknown' })
    return []
  }
}

// Save message to Supabase (used when streaming or for server-side persistence)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  model: string,
  tokens?: { prompt: number; completion: number }
): Promise<void> {
  if (!supabase) {
    logger.warn('Supabase not configured, skipping message save')
    return
  }

  try {
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
      model,
      prompt_tokens: tokens?.prompt || 0,
      completion_tokens: tokens?.completion || 0,
      total_tokens: (tokens?.prompt || 0) + (tokens?.completion || 0)
    })

    // Update conversation stats
    await supabase.rpc('increment_conversation_stats', {
      p_conversation_id: conversationId,
      p_message_count: 1,
      p_tokens: (tokens?.prompt || 0) + (tokens?.completion || 0)
    })
  } catch (err) {
    logger.error('Error saving message', { error: err instanceof Error ? err.message : 'Unknown' })
  }
}

// Generate AI response with provider fallback
async function generateResponse(
  messages: ChatMessage[],
  config: {
    provider: string
    model: string
    temperature: number
    maxTokens: number
  }
): Promise<{ content: string; tokens: { prompt: number; completion: number }; model: string }> {
  const { provider, model, temperature, maxTokens } = config

  // Try the requested provider first, then fallback
  const providers = [provider, 'openrouter', 'anthropic', 'openai'].filter((v, i, a) => a.indexOf(v) === i)

  for (const p of providers) {
    try {
      if (p === 'anthropic' && anthropic) {
        const systemMessage = messages.find(m => m.role === 'system')?.content || ''
        const chatMessages = messages.filter(m => m.role !== 'system')

        const response = await anthropic.messages.create({
          model: model.includes('claude') ? model : 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          system: systemMessage,
          messages: chatMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }))
        })

        const content = response.content[0].type === 'text' ? response.content[0].text : ''
        return {
          content,
          tokens: { prompt: response.usage.input_tokens, completion: response.usage.output_tokens },
          model: response.model
        }
      }

      if (p === 'openai' && openai) {
        const response = await openai.chat.completions.create({
          model: model.includes('gpt') ? model : 'gpt-4-turbo-preview',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens: maxTokens
        })

        return {
          content: response.choices[0]?.message?.content || '',
          tokens: {
            prompt: response.usage?.prompt_tokens || 0,
            completion: response.usage?.completion_tokens || 0
          },
          model: response.model
        }
      }

      if (p === 'openrouter' && openrouter) {
        const response = await openrouter.chat.completions.create({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens: maxTokens
        })

        return {
          content: response.choices[0]?.message?.content || '',
          tokens: {
            prompt: response.usage?.prompt_tokens || 0,
            completion: response.usage?.completion_tokens || 0
          },
          model: response.model || 'llama-3.1-8b'
        }
      }
    } catch (error) {
      logger.warn(`Provider ${p} failed, trying next`, {
        error: error instanceof Error ? error.message : 'Unknown'
      })
      continue
    }
  }

  throw new Error('All AI providers failed')
}

// Streaming response handler
async function createStreamingResponse(
  messages: ChatMessage[],
  config: {
    provider: string
    model: string
    temperature: number
    maxTokens: number
  }
): Promise<ReadableStream> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        let totalContent = ''
        let tokens = { prompt: 0, completion: 0 }

        if (config.provider === 'anthropic' && anthropic) {
          const systemMessage = messages.find(m => m.role === 'system')?.content || ''
          const chatMessages = messages.filter(m => m.role !== 'system')

          const stream = await anthropic.messages.stream({
            model: config.model.includes('claude') ? config.model : 'claude-3-5-sonnet-20241022',
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            system: systemMessage,
            messages: chatMessages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            }))
          })

          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              totalContent += event.delta.text
              const data = JSON.stringify({ type: 'text', content: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          const final = await stream.finalMessage()
          tokens = { prompt: final.usage.input_tokens, completion: final.usage.output_tokens }

        } else if (config.provider === 'openai' && openai) {
          const stream = await openai.chat.completions.create({
            model: config.model.includes('gpt') ? config.model : 'gpt-4-turbo-preview',
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: true
          })

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              totalContent += content
              const data = JSON.stringify({ type: 'text', content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

        } else if (openrouter) {
          const stream = await openrouter.chat.completions.create({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: true
          })

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              totalContent += content
              const data = JSON.stringify({ type: 'text', content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
        } else {
          throw new Error('No AI provider available')
        }

        // Send completion
        const doneData = JSON.stringify({
          type: 'done',
          content: totalContent,
          tokens
        })
        controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))
        controller.close()

      } catch (error) {
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

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ChatRequest = await request.json()

    const {
      message,
      conversationId,
      mode = 'chat',
      model = 'gpt-4o',
      systemPrompt,
      temperature = 0.7,
      maxTokens = 4096,
      stream = false,
      includeHistory = true,
      historyLimit = 20
    } = body

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Message and conversationId are required' },
        { status: 400 }
      )
    }

    logger.info('AI Assistant chat request', {
      conversationId,
      mode,
      model,
      messageLength: message.length,
      stream
    })

    // Get model configuration
    const modelInfo = modelConfig[model as keyof typeof modelConfig] || { provider: 'openrouter', model: 'meta-llama/llama-3.1-8b-instruct:free' }

    // Build messages array with context
    const messages: ChatMessage[] = []

    // Add system prompt
    const effectiveSystemPrompt = systemPrompt || modeSystemPrompts[mode] || modeSystemPrompts.chat
    messages.push({ role: 'system', content: effectiveSystemPrompt })

    // Add conversation history for context
    if (includeHistory) {
      const history = await getConversationHistory(conversationId, historyLimit)
      messages.push(...history)
    }

    // Add the new user message
    messages.push({ role: 'user', content: message })

    // Handle streaming response
    if (stream) {
      const readable = await createStreamingResponse(messages, {
        provider: modelInfo.provider,
        model: modelInfo.model,
        temperature,
        maxTokens
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }

    // Generate non-streaming response
    const result = await generateResponse(messages, {
      provider: modelInfo.provider,
      model: modelInfo.model,
      temperature,
      maxTokens
    })

    const duration = Date.now() - startTime

    logger.info('AI response generated', {
      conversationId,
      model: result.model,
      tokens: result.tokens,
      duration
    })

    // Extract suggestions from response
    const suggestions = extractSuggestions(result.content, mode)
    const actionItems = extractActionItems(result.content)

    return NextResponse.json({
      success: true,
      response: {
        content: result.content,
        suggestions,
        actionItems,
        metadata: {
          model: result.model,
          tokens: result.tokens,
          duration,
          mode
        }
      }
    })

  } catch (error) {
    logger.error('AI Assistant chat error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'AI service temporarily unavailable. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Extract follow-up suggestions from response
function extractSuggestions(content: string, mode: string): string[] {
  const suggestions: string[] = []

  if (mode === 'code') {
    suggestions.push('Explain this code', 'Add error handling', 'Write tests', 'Optimize performance')
  } else if (mode === 'creative') {
    suggestions.push('Give me more options', 'Make it shorter', 'Make it more formal', 'Add more emotion')
  } else if (mode === 'analysis') {
    suggestions.push('Show me the data', 'What are the key insights?', 'Create a summary', 'Recommend actions')
  } else {
    suggestions.push('Tell me more', 'Can you give an example?', 'What should I do next?', 'Summarize this')
  }

  return suggestions.slice(0, 4)
}

// Extract action items from response content
function extractActionItems(content: string): Array<{ title: string; priority: string }> {
  const actionItems: Array<{ title: string; priority: string }> = []
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    // Match numbered items or bullet points
    if (/^(\d+\.|[-*])\s+/.test(trimmed) && trimmed.length > 10 && trimmed.length < 150) {
      const title = trimmed.replace(/^(\d+\.|[-*])\s*/, '').slice(0, 100)
      if (title.length > 5) {
        actionItems.push({
          title,
          priority: 'medium'
        })
      }
    }
    if (actionItems.length >= 5) break
  }

  return actionItems
}

export async function GET() {
  const providers = {
    openai: !!openai,
    anthropic: !!anthropic,
    openrouter: !!openrouter
  }

  const activeProviders = Object.entries(providers).filter(([, v]) => v).map(([k]) => k)

  return NextResponse.json({
    status: activeProviders.length > 0 ? 'active' : 'no_providers',
    endpoint: '/api/ai/assistant-chat',
    version: '2.0.0',
    capabilities: ['chat', 'code', 'creative', 'analysis', 'streaming', 'history'],
    providers,
    models: Object.keys(modelConfig),
    timestamp: new Date().toISOString()
  })
}
