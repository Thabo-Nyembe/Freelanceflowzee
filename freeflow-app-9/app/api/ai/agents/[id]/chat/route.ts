/**
 * AI Agent Chat API
 *
 * POST /api/ai/agents/[id]/chat - Send message to agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('ai-agent-chat')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id: agentId } = await context.params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, context: userContext } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Get or create conversation
    let conversation: { id: string; messages: { role: string; content: string }[] }
    let existingMessages: { role: string; content: string }[] = []

    if (conversationId) {
      const { data: conv } = await supabase
        .from('agent_conversations')
        .select('id, messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (conv) {
        conversation = conv as { id: string; messages: { role: string; content: string }[] }
        existingMessages = conv.messages as { role: string; content: string }[] || []
      } else {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
    } else {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('agent_conversations')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          title: message.substring(0, 100),
          messages: [],
          context: userContext || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (convError || !newConv) {
        logger.error('Error creating conversation', { error: convError })
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        )
      }

      conversation = newConv as { id: string; messages: { role: string; content: string }[] }
    }

    // Build messages array for OpenAI
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: agent.system_prompt },
    ]

    // Add context if provided
    if (userContext) {
      messages.push({
        role: 'system',
        content: `Current context: ${JSON.stringify(userContext)}`,
      })
    }

    // Add conversation history
    existingMessages.forEach((msg) => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    })

    // Add new user message
    messages.push({ role: 'user', content: message })

    // Get agent capabilities for tools
    const tools: OpenAI.ChatCompletionTool[] = []

    if (agent.capabilities?.web_search) {
      tools.push({
        type: 'function',
        function: {
          name: 'search_web',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
            },
            required: ['query'],
          },
        },
      })
    }

    // Get custom actions for this agent
    const { data: actions } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_enabled', true)

    if (actions && actions.length > 0) {
      actions.forEach((action) => {
        tools.push({
          type: 'function',
          function: {
            name: action.name.toLowerCase().replace(/\s+/g, '_'),
            description: action.description,
            parameters: action.parameters,
          },
        })
      })
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.model || 'gpt-4o',
      messages,
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 2000,
      tools: tools.length > 0 ? tools : undefined,
    })

    const assistantMessage = completion.choices[0]?.message

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Handle tool calls if any
    let responseContent = assistantMessage.content || ''
    const toolCalls = assistantMessage.tool_calls

    if (toolCalls && toolCalls.length > 0) {
      // Process tool calls
      const toolResults: string[] = []

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        // Handle built-in functions
        if (functionName === 'search_web') {
          toolResults.push(`[Web search for: ${args.query}]`)
        }

        // Handle custom actions
        const action = actions?.find(
          (a) => a.name.toLowerCase().replace(/\s+/g, '_') === functionName
        )

        if (action) {
          if (action.action_type === 'webhook' && action.webhook_url) {
            try {
              const webhookResponse = await fetch(action.webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: functionName, args, user_id: user.id }),
              })
              const result = await webhookResponse.json()
              toolResults.push(`Action "${action.name}": ${JSON.stringify(result)}`)
            } catch {
              toolResults.push(`Action "${action.name}" failed to execute`)
            }
          } else {
            toolResults.push(`Action "${action.name}" triggered with: ${JSON.stringify(args)}`)
          }
        }
      }

      // Get final response with tool results
      if (toolResults.length > 0) {
        const followUpMessages: { role: 'system' | 'user' | 'assistant' | 'tool'; content: string }[] = [
          ...messages,
          { role: 'assistant', content: responseContent || '' },
          { role: 'tool', content: toolResults.join('\n') },
        ]

        const followUp = await openai.chat.completions.create({
          model: agent.model || 'gpt-4o',
          messages: followUpMessages as OpenAI.ChatCompletionMessageParam[],
          temperature: agent.temperature || 0.7,
          max_tokens: agent.max_tokens || 2000,
        })

        responseContent = followUp.choices[0]?.message?.content || responseContent
      }
    }

    // Update conversation with new messages
    const updatedMessages = [
      ...existingMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: responseContent },
    ]

    await supabase
      .from('agent_conversations')
      .update({
        messages: updatedMessages,
        message_count: updatedMessages.length,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: {
        role: 'assistant',
        content: responseContent,
      },
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
      },
    })
  } catch (error) {
    logger.error('Agent chat error', { error })
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
