import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-OpenAICollaboration')

/**
 * OpenAI Collaboration API
 *
 * Provides AI-powered assistance for collaboration features:
 * - Smart content suggestions
 * - Meeting summaries
 * - Document analysis
 * - Action item extraction
 * - Sentiment analysis
 * - Language translation
 */

interface AICollaborationRequest {
  action: 'summarize' | 'extract-actions' | 'analyze-sentiment' | 'translate' | 'suggest' | 'improve'
  content: string
  context?: {
    documentType?: string
    participants?: string[]
    previousContent?: string
    targetLanguage?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: AICollaborationRequest = await request.json()
    const { action, content, context = {} } = body

    if (!action || !content) {
      return NextResponse.json(
        { error: 'action and content are required' },
        { status: 400 }
      )
    }

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      // Return demo response for testing
      return getDemoResponse(action, content, context)
    }

    let prompt = ''
    let systemPrompt = 'You are a helpful AI assistant specialized in collaboration and document analysis.'

    switch (action) {
      case 'summarize':
        systemPrompt = 'You are an expert at creating concise, actionable summaries. Focus on key points and decisions.'
        prompt = `Summarize the following content in a clear, concise format:\n\n${content}`
        break

      case 'extract-actions':
        systemPrompt = 'You are an expert at identifying action items and tasks from conversations and documents.'
        prompt = `Extract all action items and tasks from the following content. Format each as a bullet point with owner (if mentioned) and deadline (if mentioned):\n\n${content}`
        break

      case 'analyze-sentiment':
        systemPrompt = 'You are an expert at analyzing sentiment and tone in professional communications.'
        prompt = `Analyze the sentiment and tone of the following content. Provide: 1) Overall sentiment (positive/neutral/negative), 2) Key emotional indicators, 3) Suggestions for improvement if needed:\n\n${content}`
        break

      case 'translate':
        const targetLang = context.targetLanguage || 'English'
        systemPrompt = 'You are a professional translator with expertise in business communications.'
        prompt = `Translate the following content to ${targetLang}. Maintain professional tone and context:\n\n${content}`
        break

      case 'suggest':
        systemPrompt = 'You are a collaborative writing assistant that provides helpful suggestions.'
        prompt = `Based on the context and content, provide 3-5 helpful suggestions for improvement or next steps:\n\nContext: ${context.documentType || 'general document'}\nContent: ${content}`
        break

      case 'improve':
        systemPrompt = 'You are a professional editor who improves clarity, tone, and effectiveness of writing.'
        prompt = `Improve the following content for clarity and professionalism. Maintain the original meaning:\n\n${content}`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API request failed')
    }

    const data = await response.json()
    const result = data.choices[0]?.message?.content || ''

    // Log usage
    logger.info('OpenAI collaboration request processed', {
      action,
      userId: user.id,
      tokensUsed: data.usage?.total_tokens || 0,
    })

    // Store in database for history
    await supabase.from('ai_collaboration_history').insert({
      user_id: user.id,
      action: action,
      input_content: content.substring(0, 1000),
      output_content: result.substring(0, 2000),
      tokens_used: data.usage?.total_tokens || 0,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      action: action,
      result: result,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    })

  } catch (error) {
    logger.error('OpenAI collaboration failed', { error: error.message })
    return NextResponse.json(
      { error: 'AI processing failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Demo responses when OpenAI key is not available
function getDemoResponse(action: string, content: string, context: any) {
  const responses: Record<string, any> = {
    summarize: {
      success: true,
      action: 'summarize',
      result: `**Summary**\n\nThis content discusses key points about the project. Main highlights include:\n- Important decisions were made regarding timeline\n- Team alignment on objectives\n- Next steps clearly defined\n\n**Key Takeaways:**\n1. Progress is on track\n2. Collaboration is strong\n3. Action items assigned`,
      demo: true,
    },
    'extract-actions': {
      success: true,
      action: 'extract-actions',
      result: `**Action Items:**\n\n- [ ] Review project documentation (Owner: Team Lead, Due: This week)\n- [ ] Schedule follow-up meeting (Owner: Project Manager)\n- [ ] Complete feature implementation (Owner: Development Team, Due: End of sprint)\n- [ ] Prepare status report (Owner: Team Lead, Due: Friday)`,
      demo: true,
    },
    'analyze-sentiment': {
      success: true,
      action: 'analyze-sentiment',
      result: `**Sentiment Analysis:**\n\n**Overall Sentiment:** Positive (78%)\n\n**Key Indicators:**\n- Enthusiasm about progress\n- Collaborative tone\n- Solution-focused language\n\n**Suggestions:**\n- Consider acknowledging challenges more explicitly\n- Add specific metrics for clarity`,
      demo: true,
    },
    translate: {
      success: true,
      action: 'translate',
      result: `[Translation to ${context.targetLanguage || 'English'}]\n\n${content}\n\n(Demo translation - connect OpenAI API for actual translation)`,
      demo: true,
    },
    suggest: {
      success: true,
      action: 'suggest',
      result: `**Suggestions:**\n\n1. Add more specific details about deliverables\n2. Include timeline with milestones\n3. Define success metrics clearly\n4. Consider adding risk mitigation strategies\n5. Include stakeholder communication plan`,
      demo: true,
    },
    improve: {
      success: true,
      action: 'improve',
      result: `**Improved Version:**\n\n${content}\n\n**Changes Made:**\n- Enhanced clarity\n- Improved professional tone\n- Added structure\n- Streamlined language\n\n(Demo improvement - connect OpenAI API for actual improvements)`,
      demo: true,
    },
  }

  return NextResponse.json(responses[action] || {
    success: true,
    action: action,
    result: 'Demo response - connect OpenAI API for actual results',
    demo: true,
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Get AI usage history
    if (action === 'history') {
      const { data: history, error } = await supabase
        .from('ai_collaboration_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: history || [],
      })
    }

    // Get usage statistics
    if (action === 'stats') {
      const { data: stats, error } = await supabase
        .from('ai_collaboration_history')
        .select('action, tokens_used')
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({
          success: true,
          data: {
            totalRequests: 0,
            totalTokens: 0,
            byAction: {},
          },
        })
      }

      const byAction: Record<string, number> = {}
      let totalTokens = 0

      stats?.forEach(s => {
        byAction[s.action] = (byAction[s.action] || 0) + 1
        totalTokens += s.tokens_used || 0
      })

      return NextResponse.json({
        success: true,
        data: {
          totalRequests: stats?.length || 0,
          totalTokens,
          byAction,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'OpenAI Collaboration API ready',
      availableActions: [
        'summarize - Create concise summaries',
        'extract-actions - Extract action items and tasks',
        'analyze-sentiment - Analyze tone and sentiment',
        'translate - Translate content to another language',
        'suggest - Get improvement suggestions',
        'improve - Improve content clarity and tone',
      ],
      endpoints: {
        'POST': 'Process AI collaboration request',
        'GET ?action=history': 'Get AI usage history',
        'GET ?action=stats': 'Get AI usage statistics',
      },
    })

  } catch (error) {
    logger.error('OpenAI collaboration GET failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to fetch AI collaboration data' },
      { status: 500 }
    )
  }
}
