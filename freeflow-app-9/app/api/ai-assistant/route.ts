/**
 * AI Assistant API Routes
 *
 * REST endpoints for AI Assistant feature:
 * GET - List conversations or get stats
 * POST - Create conversation, message, or insight
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-assistant')
import {

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
  getConversations,
  createConversation,
  getConversationStats,
  getInsights,
  createInsight,
  getQuickActions,
  createMessage
} from '@/lib/ai-assistant-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'conversations'
    const status = searchParams.get('status') as string | null
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') as string | null
    const priority = searchParams.get('priority') as string | null

    switch (type) {
      case 'conversations': {
        const { data, error } = await getConversations(user.id, {
          status,
          search
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getConversationStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'insights': {
        const { data, error } = await getInsights(user.id, {
          category,
          priority,
          status
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'quick-actions': {
        const actionCategory = searchParams.get('category') || undefined
        const { data, error } = await getQuickActions({ category: actionCategory })
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch AI assistant data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI assistant data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-conversation': {
        const { title, model, tags, metadata } = payload
        const { data, error } = await createConversation(user.id, title, {
          model,
          tags,
          metadata
        })
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-insight': {
        const { data, error } = await createInsight(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'send-message': {
        const { conversationId, content, type } = payload

        // Create the user/system message
        const { data: messageData, error: messageError } = await createMessage(
          conversationId,
          content,
          type || 'user'
        )
        if (messageError) throw messageError

        // Generate AI response (simulated for now - in production, call actual AI API)
        const startTime = Date.now()
        const aiResponse = generateAIResponse(content)
        const responseTime = Date.now() - startTime

        // Create the assistant message
        const { data: assistantMessage, error: assistantError } = await createMessage(
          conversationId,
          aiResponse.content,
          'assistant',
          {
            provider: 'anthropic',
            model: 'claude-3-opus',
            tokens: aiResponse.tokens,
            response_time: responseTime,
            suggestions: aiResponse.suggestions
          }
        )
        if (assistantError) throw assistantError

        return NextResponse.json({
          data: {
            userMessage: messageData,
            assistantMessage
          }
        }, { status: 201 })
      }

      case 'regenerate-response': {
        const { conversationId, originalMessageId } = payload

        // Generate new AI response
        const startTime = Date.now()
        const aiResponse = generateAIResponse('Please provide an alternative response')
        const responseTime = Date.now() - startTime

        const { data: assistantMessage, error } = await createMessage(
          conversationId,
          aiResponse.content,
          'assistant',
          {
            provider: 'anthropic',
            model: 'claude-3-opus',
            tokens: aiResponse.tokens,
            response_time: responseTime,
            suggestions: aiResponse.suggestions,
            metadata: { regenerated_from: originalMessageId }
          }
        )
        if (error) throw error

        return NextResponse.json({ data: assistantMessage }, { status: 201 })
      }

      case 'process-file': {
        const { fileId, fileName, fileSize } = payload

        // Simulate file processing (in production, this would process the file with AI)
        const chunks = Math.floor(fileSize / 1000)

        return NextResponse.json({
          data: {
            id: fileId,
            status: 'ready',
            chunks,
            processed_at: new Date().toISOString()
          }
        })
      }

      case 'voice-transcribe': {
        // Simulate voice transcription (in production, use speech-to-text API)
        const transcribedText = 'Hello, can you help me with my project? I need assistance with...'

        return NextResponse.json({
          data: {
            text: transcribedText,
            confidence: 0.95,
            language: 'en'
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process AI assistant request', { error })
    return NextResponse.json(
      { error: 'Failed to process AI assistant request' },
      { status: 500 }
    )
  }
}

// Helper function to generate AI responses
// In production, this would call the actual AI API (OpenAI, Anthropic, etc.)
function generateAIResponse(userMessage: string): {
  content: string
  tokens: number
  suggestions: string[]
} {
  // Analyze the user message to generate contextual response
  const lowerMessage = userMessage.toLowerCase()

  let content: string
  let suggestions: string[]

  if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
    content = `I understand you're looking for help with coding. Here's a comprehensive solution:

**Analysis:**
I've analyzed your request and identified the key requirements.

**Solution:**
Based on your needs, here's my recommendation with a step-by-step approach:

1. First, understand the problem domain
2. Break down the requirements into smaller tasks
3. Implement each component with proper error handling
4. Test thoroughly and iterate

Let me know if you'd like me to elaborate on any specific aspect or provide code examples.`
    suggestions = ['Show me an example', 'Explain the architecture', 'What are best practices?']
  } else if (lowerMessage.includes('data') || lowerMessage.includes('analysis')) {
    content = `I'll help you with data analysis. Here's my approach:

**Data Overview:**
Based on your query, I can help you analyze patterns and derive insights.

**Methodology:**
1. Data collection and cleaning
2. Exploratory data analysis
3. Statistical analysis and visualization
4. Actionable insights and recommendations

Would you like me to proceed with a specific aspect of the analysis?`
    suggestions = ['Generate visualizations', 'Statistical summary', 'Export findings']
  } else if (lowerMessage.includes('write') || lowerMessage.includes('content')) {
    content = `I'd be happy to assist with content creation. Here's what I can help with:

**Content Strategy:**
Based on your requirements, I suggest the following approach:

1. Define your target audience
2. Outline key messages and themes
3. Create engaging, well-structured content
4. Review and refine for impact

What type of content would you like me to create?`
    suggestions = ['Draft an outline', 'Write a full piece', 'Edit existing content']
  } else {
    content = `I understand your request. Let me help you with that.

**Summary:**
I've analyzed your input and here's my comprehensive response:

Based on the information provided, I can offer guidance tailored to your specific needs. My approach includes:

1. Understanding the context and requirements
2. Providing actionable recommendations
3. Offering step-by-step guidance
4. Supporting you through implementation

Is there a specific area you'd like me to focus on?`
    suggestions = ['Tell me more', 'Provide examples', 'What are the next steps?']
  }

  // Estimate tokens (rough approximation)
  const tokens = Math.floor(content.length / 4) + Math.floor(userMessage.length / 4)

  return { content, tokens, suggestions }
}
