import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
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

const logger = createFeatureLogger('API-AIChat')

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)

    const body = await request.json();
    const {
      message,
      systemPrompt,
      taskType = 'chat',
      maxTokens = 4096,
      temperature = 0.7,
      userId: providedUserId
    } = body;

    // Use session userId if available, fall back to provided userId
    const userId = session?.user?.id || providedUserId

    if (!userId) {
      logger.warn('AI Chat request without authentication')
      return NextResponse.json(
        { success: false, error: 'Authentication required for AI services' },
        { status: 401 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    logger.info('AI Chat request', {
      taskType,
      messageLength: message.length,
      userId,
      authenticated: !!session
    })

    // Use real AI router
    const response = await kaziAI.routeRequest({
      type: taskType as AITaskType,
      prompt: message,
      systemPrompt: systemPrompt || 'You are Kazi AI, an expert assistant for freelancers and creative professionals. Provide helpful, actionable advice.',
      maxTokens,
      temperature,
      userId
    })

    // Generate suggestions based on response
    const suggestions = generateSuggestions(response.content, taskType)
    const actionItems = extractActionItems(response.content)

    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        suggestions,
        actionItems,
        metadata: {
          provider: response.provider,
          model: response.model,
          tokens: response.tokens,
          cost: response.cost,
          duration: response.duration,
          cached: response.cached || false
        }
      }
    });
  } catch (error) {
    logger.error('AI Chat Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Return user-friendly error
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

// Generate follow-up suggestions based on AI response
function generateSuggestions(content: string, taskType: string): string[] {
  const suggestions: string[] = []

  // Context-aware suggestions
  if (taskType === 'strategic') {
    suggestions.push('Create an action plan', 'Set milestones', 'Identify risks')
  } else if (taskType === 'creative') {
    suggestions.push('Explore variations', 'Add more detail', 'Simplify the concept')
  } else if (taskType === 'coding') {
    suggestions.push('Add error handling', 'Write tests', 'Optimize performance')
  } else {
    suggestions.push('Tell me more', 'Can you elaborate?', 'What are the next steps?')
  }

  return suggestions.slice(0, 3)
}

// Extract action items from AI response
function extractActionItems(content: string): Array<{
  title: string
  action: string
  priority: string
  estimatedTime: string
  impact: string
}> {
  const actionItems: Array<{
    title: string
    action: string
    priority: string
    estimatedTime: string
    impact: string
  }> = []

  // Look for numbered lists or bullet points that might be action items
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    // Match numbered items or bullet points
    if (/^(\d+\.|[-*•])/.test(trimmed) && trimmed.length > 10 && trimmed.length < 200) {
      const title = trimmed.replace(/^(\d+\.|[-*•])\s*/, '').slice(0, 100)
      if (title.length > 5) {
        actionItems.push({
          title,
          action: 'review',
          priority: 'medium',
          estimatedTime: '30 minutes',
          impact: 'medium'
        })
      }
    }
    if (actionItems.length >= 5) break
  }

  return actionItems
}

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/ai/chat',
    supportedTaskTypes: ['chat', 'analysis', 'creative', 'legal', 'strategic', 'operational', 'coding'],
    version: '2.0.0'
  })
}